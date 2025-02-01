import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const GetDefaultWhatsApp = async (whatsappId?: number, companyId: number | null = null, userId?: number): Promise<Whatsapp> => {

  let connection: Whatsapp;
  let defaultWhatsapp = null;

  if (whatsappId) {
    defaultWhatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, companyId }
    });
  } else {
    await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
  }


  if (defaultWhatsapp?.status === 'CONNECTED') {
    connection = defaultWhatsapp;
  } else {
    const whatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
    connection = whatsapp;
  }

  /*
  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if (whatsappByUser?.status === 'CONNECTED') {
      connection = whatsappByUser;
    } else {
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      connection = whatsapp;
    }
  }
  */

  if (!connection) {
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
  }

  return connection;
};

export default GetDefaultWhatsApp;
