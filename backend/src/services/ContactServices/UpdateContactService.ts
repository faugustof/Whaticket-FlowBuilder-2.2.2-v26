import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";

interface ExtraInfo {
  id?: number;
  name: string;
  value: string;
}
interface Wallet {
  walletId: number | string;
  contactId: number | string;
  companyId: number | string;
}

interface ContactData {
  email?: string;
  number?: string;
  name?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  extraInfo?: ExtraInfo[];
  disableBot?: boolean;
  remoteJid?: string;
  wallets?: null | number[] | string[];
}

interface Request {
  contactData: ContactData;
  contactId: string;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId
}: Request): Promise<Contact> => {
  const { email, name, number, extraInfo, acceptAudioMessage, active, disableBot, remoteJid, wallets } = contactData;

  const contact = await Contact.findOne({
    where: { id: contactId },
    attributes: ["id", "name", "number", "channel", "email", "companyId", "acceptAudioMessage", "active", "profilePicUrl", "remoteJid", "urlPicture"],
    include: ["extraInfo", "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      }]
  });

  if (contact?.companyId !== companyId) {
    throw new AppError("Não é possível alterar registros de outra empresa");
  }

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  if (extraInfo) {
    await Promise.all(
      extraInfo.map(async (info: any) => {
        await ContactCustomField.upsert({ ...info, contactId: contact.id });
      })
    );

    await Promise.all(
      contact.extraInfo.map(async oldInfo => {
        const stillExists = extraInfo.findIndex(info => info.id === oldInfo.id);

        if (stillExists === -1) {
          await ContactCustomField.destroy({ where: { id: oldInfo.id } });
        }
      })
    );
  }

  if (wallets) {
    await ContactWallet.destroy({
      where: {
        companyId,
        contactId
      }
    });

    const contactWallets: Wallet[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallets.forEach((wallet: any) => {
      contactWallets.push({
        walletId: !wallet.id ? wallet : wallet.id,
        contactId,
        companyId
      });
    });

    await ContactWallet.bulkCreate(contactWallets);
  }

  await contact.update({
    name,
    number,
    email,
    acceptAudioMessage,
    active,
    disableBot,
    remoteJid
  });

  await contact.reload({
    attributes: ["id", "name", "number", "channel", "email", "companyId", "acceptAudioMessage", "active", "profilePicUrl", "remoteJid", "urlPicture"],
    include: ["extraInfo", "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      }]
  });

  return contact;
};

export default UpdateContactService;
