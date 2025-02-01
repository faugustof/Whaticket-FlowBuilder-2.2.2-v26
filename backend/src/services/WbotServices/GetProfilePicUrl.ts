import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

const GetProfilePicUrl = async (
  number: string,
  companyId: number,
  contact?: Contact,
): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(defaultWhatsapp.id);

  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(contact && contact.isGroup ? contact.remoteJid:`${number}@s.whatsapp.net`, "image");
  } catch (error) {
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  return profilePicUrl;
};

export default GetProfilePicUrl;
