import { delay, WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import fs from "fs";
import path from "path";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";

interface Request {
  whatsappId: number;
  contact: Contact;
  url: string;
  caption: string;
  msdelay?: number;
}

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const SendWhatsAppMessageLink = async ({
  whatsappId,
  contact,
  url,
  caption,
  msdelay
}: Request): Promise<WAMessage> => {
  const wbot = await getWbot(whatsappId);
  const number = `${contact.number}@${contact.isGroup ? "g.us" : "s.whatsapp.net"}`;

  const name = caption.replace('/', '-')

  try {

    await delay(msdelay)
    const sentMessage = await wbot.sendMessage(
      `${number}`,
      {
        document: url ? { url } : fs.readFileSync(`${publicFolder}/company${contact.companyId}/${name}-${makeid(5)}.pdf`),
        fileName: name,
        mimetype: 'application/pdf'
      }
    );

    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }

};

export default SendWhatsAppMessageLink;
