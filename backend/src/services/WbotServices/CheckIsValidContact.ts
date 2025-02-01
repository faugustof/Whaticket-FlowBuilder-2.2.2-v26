import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckIsValidContact = async (number: string, companyId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(defaultWhatsapp.id);
  try {
    const [result] = await (wbot as WASocket).onWhatsApp(
      `${number}@s.whatsapp.net`
    );
    
    if (!result && !result?.exists) {
      throw new AppError("invalidNumber");
    }
  } catch (err) {
    console.log(err);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
