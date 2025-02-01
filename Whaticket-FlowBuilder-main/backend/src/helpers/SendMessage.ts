import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import fs from "fs";
import formatBody from "./Mustache";

import { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";

export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
  companyId?: number;
  mediaName?: string;
};

export const SendMessage = async (
  whatsapp: Whatsapp,
  messageData: MessageData,
  isGroup: boolean = false

): Promise<any> => {
  try {
    const wbot = await GetWhatsappWbot(whatsapp);
    const chatId = `${messageData.number}@${!!isGroup ? 'g.us' : 's.whatsapp.net'}`;
    const companyId = messageData?.companyId ? messageData.companyId.toString(): null;

    let message;

    if (messageData.mediaPath) {
      const options = await getMessageOptions(
        messageData.mediaName,
        messageData.mediaPath,
        companyId,
        messageData.body,
      );
      if (options) {
        const body = fs.readFileSync(messageData.mediaPath);
        message = await wbot.sendMessage(chatId, {
          ...options
        });
      }
    } else {
      const body = formatBody(`${messageData.body}`);
      message = await wbot.sendMessage(chatId, { text: body });
    }

    return message;
  } catch (err: any) {
    throw new Error(err);
  }
};
