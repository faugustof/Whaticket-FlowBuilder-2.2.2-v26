import { WAMessage, delay } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import { isNil } from "lodash";

import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  msdelay?: number;
  vCard?: Contact;
  isForwarded?: boolean;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  msdelay,
  vCard,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  const contactNumber = await Contact.findByPk(ticket.contactId)

  let number: string;

  if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
    number = contactNumber.remoteJid;
  } else {
    number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
      }`;
  }

  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);


      if (msgFound.message.extendedTextMessage !== undefined) {
        options = {
          quoted: {
            key: msgFound.key,
            message: {
              extendedTextMessage: msgFound.message.extendedTextMessage,
            }
          },
        };
      } else {
        options = {
          quoted: {
            key: msgFound.key,
            message: {
              conversation: msgFound.message.conversation,
            }
          },
        };
      }
    }
  }

  if (!isNil(vCard)) {
    const numberContact = vCard.number;
    const firstName = vCard.name.split(' ')[0];
    const lastName = String(vCard.name).replace(vCard.name.split(' ')[0], '')

    const vcard = `BEGIN:VCARD\n`
      + `VERSION:3.0\n`
      + `N:${lastName};${firstName};;;\n`
      + `FN:${vCard.name}\n`
      + `TEL;type=CELL;waid=${numberContact}:+${numberContact}\n`
      + `END:VCARD`;

    try {
      await delay(msdelay)
      const sentMessage = await wbot.sendMessage(
        number,
        {
          contacts: {
            displayName: `${vCard.name}`,
            contacts: [{ vcard }]
          }
        }
      );
      await ticket.update({ lastMessage: formatBody(vcard, ticket), imported: null });
      return sentMessage;
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  };
  try {
    await delay(msdelay)
    const sentMessage = await wbot.sendMessage(
      number,
      {
        text: formatBody(body, ticket),
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded ? true : false }
      },
      {
        ...options
      }
    );
    await ticket.update({ lastMessage: formatBody(body, ticket), imported: null });
    return sentMessage;
  } catch (err) {
    console.log(`erro ao enviar mensagem na company ${ticket.companyId} - `, body,
      ticket,
      quotedMsg,
      msdelay,
      vCard,
      isForwarded)
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
