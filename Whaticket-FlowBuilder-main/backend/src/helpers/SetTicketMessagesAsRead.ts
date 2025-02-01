import { proto, WASocket } from "@whiskeysockets/baileys";
import cacheLayer from "../libs/cache";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import logger from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {

  if (ticket.whatsappId) {
    // console.log("SETTING MESSAGES AS READ", ticket.whatsappId)
    const whatsapp = await ShowWhatsAppService(
      ticket.whatsappId,


      ticket.companyId
    );

    if (["open", "group"].includes(ticket.status) && whatsapp && whatsapp.status === 'CONNECTED' && ticket.unreadMessages > 0) {
      try {
        const wbot = await GetTicketWbot(ticket);
        // no baileys temos que marcar cada mensagem como lida
        // não o chat inteiro como é feito no legacy
        const getJsonMessage = await Message.findAll({
          where: {
            ticketId: ticket.id,
            fromMe: false,
            read: false
          },
          order: [["createdAt", "DESC"]]
        });

        if (getJsonMessage.length > 0) {

          getJsonMessage.forEach(async message => {
            const msg: proto.IWebMessageInfo = JSON.parse(message.dataJson);
            if (msg.key && msg.key.fromMe === false && !ticket.isBot && (ticket.userId || ticket.isGroup)) {

              await wbot.readMessages([msg.key])
            }
          });
        }

        await Message.update(
          { read: true },
          {
            where: {
              ticketId: ticket.id,
              read: false
            }
          }
        );

        await ticket.update({ unreadMessages: 0 });
        await cacheLayer.set(`contacts:${ticket.contactId}:unreads`, "0");

        const io = getIO();

        io.of(ticket.companyId.toString())
          // .to(ticket.status).to("notification")
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "updateUnread",
            ticketId: ticket.id
          });

      } catch (err) {
        logger.warn(
          `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
        );
      }

    }
  }

};

export default SetTicketMessagesAsRead;
