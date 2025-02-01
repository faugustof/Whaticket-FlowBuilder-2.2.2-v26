import moment from "moment";
import * as Sentry from "@sentry/node";
import { Op } from "sequelize";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import ShowTicketService from "./ShowTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { verifyMessage } from "../WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import sendFaceMessage from "../FacebookServices/sendFacebookMessage";
import { verifyMessageFace } from "../FacebookServices/facebookMessageListener";
import ShowUserService from "../UserServices/ShowUserService";
import User from "../../models/User";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "./CreateLogTicketService";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "./FindOrCreateTicketService";
import formatBody from "../../helpers/Mustache";
import { Mutex } from "async-mutex";

interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  isBot?: boolean;
  queueOptionId?: number;
  sendFarewellMessage?: boolean;
  amountUsedBotQueues?: number;
  lastMessage?: string;
  integrationId?: number;
  useIntegration?: boolean;
  unreadMessages?: number;
  msgTransfer?: string;
  isTransfered?: boolean;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  companyId: number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  try {
    let {
      queueId,
      userId,
      sendFarewellMessage = true,
      amountUsedBotQueues,
      lastMessage,
      integrationId,
      useIntegration,
      unreadMessages,
      msgTransfer,
      isTransfered = false,
      status
    } = ticketData;
    let isBot: boolean | null = ticketData.isBot || false;
    let queueOptionId: number | null = ticketData.queueOptionId || null;

    const io = getIO();

    const settings = await CompaniesSettings.findOne({
      where: {
        companyId: companyId
      }
    });

    let ticket = await ShowTicketService(ticketId, companyId);



    if (ticket.channel === "whatsapp" && ticket.whatsappId) {
      SetTicketMessagesAsRead(ticket);
    }

    const oldStatus = ticket?.status;
    const oldUserId = ticket.user?.id;
    const oldQueueId = ticket?.queueId;

    if (isNil(ticket.whatsappId) && status === "closed") {
      await CreateLogTicketService({
        userId,
        queueId: ticket.queueId,
        ticketId,
        type: "closed"
      });

      await ticket.update({
        status: "closed"
      });

      io.of(String(companyId))
        // .to(oldStatus)
        // .to(ticketId.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });
      console.log(117, "UpdateTicketService")
      return { ticket, oldStatus, oldUserId };
    }

    if (oldStatus === "closed") {
      console.log(122, "UpdateTicketService")
      let otherTicket = await Ticket.findOne({
        where: {
          contactId: ticket.contactId,
          status: { [Op.or]: ["open", "pending", "group"] },
          whatsappId: ticket.whatsappId
        }
      });
      if (otherTicket) {
        if (otherTicket.id !== ticket.id) {
          otherTicket = await ShowTicketService(otherTicket.id, companyId)
          return { ticket: otherTicket, oldStatus, oldUserId }
        }
      }

      // await CheckContactOpenTickets(ticket.contactId, ticket.whatsappId );
      isBot = false;
    }

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId,
      companyId,
      whatsappId: ticket?.whatsappId
    });
    // console.log("GETTING WHATSAPP UPDATE TICKETSERVICE", ticket?.whatsappId)
    const { complationMessage, ratingMessage, groupAsTicket } = await ShowWhatsAppService(
      ticket?.whatsappId,

      companyId
    );

    if (status !== undefined && ["closed"].indexOf(status) > -1) {

      const _userId = ticket.userId || userId;
      let user
      if (_userId) {
        user = await User.findByPk(_userId);
      }

      if (settings.userRating === "enabled" &&
        (sendFarewellMessage || sendFarewellMessage === undefined) &&
        (!isNil(ratingMessage) && ratingMessage !== "") &&
        !ticket.isGroup) {

        if (ticketTraking.ratingAt == null) {

          const ratingTxt = ratingMessage || "";
          let bodyRatingMessage = `\u200e ${ratingTxt}\n`;

          if (ticket.channel === "whatsapp" && ticket.whatsapp.status === 'CONNECTED') {
            const msg = await SendWhatsAppMessage({ body: bodyRatingMessage, ticket, isForwarded: false });
            await verifyMessage(msg, ticket, ticket.contact);
          } else
            if (["facebook", "instagram"].includes(ticket.channel)) {

              const msg = await sendFaceMessage({ body: bodyRatingMessage, ticket });
              await verifyMessageFace(msg, bodyRatingMessage, ticket, ticket.contact);
            }

          await ticketTraking.update({
            userId: ticket.userId,
            closedAt: moment().toDate()
          });

          await CreateLogTicketService({
            userId: ticket.userId,
            queueId: ticket.queueId,
            ticketId,
            type: "nps"
          });

          // try {
          //   // Retrieve tagIds associated with the provided ticketId from TicketTags
          //   const ticketTags = await TicketTag.findAll({ where: { ticketId } });
          //   const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

          //   // Find the tagIds with kanban = 1 in the Tags table
          //   const tagsWithKanbanOne = await Tag.findAll({
          //     where: {
          //       id: tagIds,
          //       kanban: 1,
          //     },
          //   });

          //   // Remove the tagIds with kanban = 1 from TicketTags
          //   const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
          //   if (tagIdsWithKanbanOne)
          //     await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });
          // } catch (error) {
          //   Sentry.captureException(error);
          // }

          await ticket.update({
            status: "nps",
            amountUsedBotQueuesNPS: 1
          })

          io.of(String(companyId))
            // .to(oldStatus)
            // .to(ticketId.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: "delete",
              ticketId: ticket.id
            });

          console.log(277, "UpdateTicketService")
          return { ticket, oldStatus, oldUserId };

        }
      }

      if (((!isNil(user?.farewellMessage) && user?.farewellMessage !== "") ||
        (!isNil(complationMessage) && complationMessage !== "")) &&
        (sendFarewellMessage || sendFarewellMessage === undefined)) {

        let body: any

        if ((ticket.status !== 'pending') || (ticket.status === 'pending' && settings.sendFarewellWaitingTicket === 'enabled')) {
          if (!isNil(user) && !isNil(user?.farewellMessage) && user?.farewellMessage !== "") {
            body = `\u200e ${user.farewellMessage}`;
          } else {
            body = `\u200e ${complationMessage}`;
          }
          if (ticket.channel === "whatsapp" && (!ticket.isGroup || groupAsTicket === "enabled") && ticket.whatsapp.status === 'CONNECTED') {
            const sentMessage = await SendWhatsAppMessage({ body, ticket, isForwarded: false });

            await verifyMessage(sentMessage, ticket, ticket.contact);

          }

          if (["facebook", "instagram"].includes(ticket.channel) && (!ticket.isGroup || groupAsTicket === "enabled")) {
            const sentMessage = await sendFaceMessage({ body, ticket });

            // await verifyMessageFace(sentMessage, body, ticket, ticket.contact );
          }
        }
      }

      ticketTraking.finishedAt = moment().toDate();
      ticketTraking.closedAt = moment().toDate();
      ticketTraking.whatsappId = ticket?.whatsappId;
      ticketTraking.userId = ticket.userId;

      // queueId = null;
      // userId = null;
      //loga fim de atendimento
      await CreateLogTicketService({
        userId,
        queueId: ticket.queueId,
        ticketId,
        type: "closed"
      });

      // try {
      //   // Retrieve tagIds associated with the provided ticketId from TicketTags
      //   const ticketTags = await TicketTag.findAll({ where: { ticketId } });
      //   const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

      //   // Find the tagIds with kanban = 1 in the Tags table
      //   const tagsWithKanbanOne = await Tag.findAll({
      //     where: {
      //       id: tagIds,
      //       kanban: 1,
      //     },
      //   });

      //   // Remove the tagIds with kanban = 1 from TicketTags
      //   const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
      //   if (tagIdsWithKanbanOne)
      //     await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });
      // } catch (error) {
      //   Sentry.captureException(error);
      // }

      await ticketTraking.save();

      await ticket.update({
        status: "closed",
        lastFlowId: null,
        dataWebhook: null,
        hashFlowId: null,
      });

      io.of(String(companyId))
        // .to(oldStatus)
        // .to(ticketId.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });
      console.log(309, "UpdateTicketService")
      return { ticket, oldStatus, oldUserId };
    }
    let queue
    if (!isNil(queueId)) {
      queue = await Queue.findByPk(queueId);
      ticketTraking.queuedAt = moment().toDate();
    }

    if (isTransfered) {
      if (settings.closeTicketOnTransfer) {
        let newTicketTransfer = ticket;
        if (oldQueueId !== queueId) {
          await ticket.update({
            status: "closed"
          });

          await ticket.reload();

          io.of(String(companyId))
            // .to(oldStatus)
            // .to(ticketId.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
              action: "delete",
              ticketId: ticket.id
            });


          newTicketTransfer = await FindOrCreateTicketService(
            ticket.contact,
            ticket.whatsapp,
            1,
            ticket.companyId,
            queueId,
            userId,
            null,
            ticket.channel, false, false, settings, isTransfered);

          await FindOrCreateATicketTrakingService({ ticketId: newTicketTransfer.id, companyId, whatsappId: ticket.whatsapp.id, userId });

        }

        if (!isNil(msgTransfer)) {
          const messageData = {
            wid: `PVT${newTicketTransfer.updatedAt.toString().replace(' ', '')}`,
            ticketId: newTicketTransfer.id,
            contactId: undefined,
            body: msgTransfer,
            fromMe: true,
            mediaType: 'extendedTextMessage',
            read: true,
            quotedMsgId: null,
            ack: 2,
            remoteJid: newTicketTransfer.contact?.remoteJid,
            participant: null,
            dataJson: null,
            ticketTrakingId: null,
            isPrivate: true
          };

          await CreateMessageService({ messageData, companyId: ticket.companyId });
        }

        await newTicketTransfer.update({
          queueId,
          userId,
          status
        })



        await newTicketTransfer.reload();

        if (settings.sendMsgTransfTicket === "enabled") {
          // Mensagem de transferencia da FILA
          if ((oldQueueId !== queueId || oldUserId !== userId) && !isNil(oldQueueId) && !isNil(queueId) && !isNil(queueId) && ticket.whatsapp.status === 'CONNECTED') {

            const wbot = await GetTicketWbot(ticket);
            const msgtxt = formatBody(`\u200e ${settings.transferMessage.replace("${queue.name}", queue?.name)}`, ticket);
            // const msgtxt = `\u200e *Mensagem Automática*:\nVocê foi transferido(a) para o departamento *${queue?.name}"*\nAguarde um momento, iremos atende-lo(a)!`;
            const queueChangedMessage = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: msgtxt
              }
            );
            await verifyMessage(queueChangedMessage, ticket, ticket.contact, ticketTraking);
          }
          // else
          //   // Mensagem de transferencia do ATENDENTE
          //   if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId) && (!ticket.isGroup || groupAsTicket === "enabled")) {
          //     const wbot = await GetTicketWbot(ticket);
          //     const nome = await ShowUserService(ticketData.userId, companyId);
          //     const msgtxt = `\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o atendente *${nome.name}*\nAguarde um momento, iremos atende-lo(a)!`;

          //     const queueChangedMessage = await wbot.sendMessage(
          //       `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //       {
          //         text: msgtxt
          //       }
          //     );
          //     await verifyMessage(queueChangedMessage, ticket, ticket.contact, ticketTraking);
          //   }
          //   else
          //     // Mensagem de transferencia do ATENDENTE e da FILA
          //     if (oldUserId !== userId && oldQueueId !== queueId && !isNil(oldUserId) && !isNil(userId) && (!ticket.isGroup || groupAsTicket === "enabled")) {
          //       const wbot = await GetTicketWbot(ticket);
          //       const nome = await ShowUserService(ticketData.userId, companyId);
          //       const msgtxt = `\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o departamento *${queue?.name}* e será atendido por *${nome.name}*\nAguarde um momento, iremos atende-lo(a)!`;

          //       const queueChangedMessage = await wbot.sendMessage(
          //         `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //         {
          //           text: msgtxt
          //         }
          //       );
          //       await verifyMessage(queueChangedMessage, ticket, ticket.contact);
          //     } else
          //       if (oldUserId !== undefined && isNil(userId) && oldQueueId !== queueId && !isNil(queueId)) {

          //         const wbot = await GetTicketWbot(ticket);
          //         const msgtxt = "\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o departamento *" + queue?.name + "*\nAguarde um momento, iremos atende-lo(a)!";

          //         const queueChangedMessage = await wbot.sendMessage(
          //           `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //           {
          //             text: msgtxt
          //           }
          //         );
          //         await verifyMessage(queueChangedMessage, ticket, ticket.contact);
          //       }

        }

        if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId)) {
          //transferiu o atendimento para fila
          await CreateLogTicketService({
            userId: oldUserId,
            queueId: oldQueueId,
            ticketId,
            type: "transfered"
          });

        } else
          if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId)) {
            //transferiu o atendimento para atendente na mesma fila
            await CreateLogTicketService({
              userId: oldUserId,
              queueId: oldQueueId,
              ticketId,
              type: "transfered"
            });
            //recebeu atendimento
            await CreateLogTicketService({
              userId,
              queueId: oldQueueId,
              ticketId: newTicketTransfer.id,
              type: "receivedTransfer"
            });
          } else
            if (oldUserId !== userId && oldQueueId !== queueId && !isNil(oldUserId) && !isNil(userId)) {
              //transferiu o atendimento para fila e atendente

              await CreateLogTicketService({
                userId: oldUserId,
                queueId: oldQueueId,
                ticketId,
                type: "transfered"
              });
              //recebeu atendimento
              await CreateLogTicketService({
                userId,
                queueId,
                ticketId: newTicketTransfer.id,
                type: "receivedTransfer"
              });
            } else
              if (oldUserId !== undefined && isNil(userId) && oldQueueId !== queueId && !isNil(queueId)) {
                await CreateLogTicketService({
                  userId: oldUserId,
                  queueId: oldQueueId,
                  ticketId,
                  type: "transfered"
                });
              }

        if (newTicketTransfer.status !== oldStatus || newTicketTransfer.user?.id !== oldUserId) {
          await ticketTraking.update({
            userId: newTicketTransfer.userId
          })
          // console.log("emitiu socket 497", ticket.id, newTicketTransfer.id)
          io.of(String(companyId))
            // .to(oldStatus)
            .emit(`company-${companyId}-ticket`, {
              action: "delete",
              ticketId: newTicketTransfer.id
            });
        }

        io.of(String(companyId))
          // .to(newTicketTransfer.status)
          // .to("notification")
          // .to(newTicketTransfer.id.toString())
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket: newTicketTransfer
          });

        return { ticket: newTicketTransfer, oldStatus, oldUserId };

      } else {

        if (settings.sendMsgTransfTicket === "enabled") {
          // Mensagem de transferencia da FILA
          if (oldQueueId !== queueId || oldUserId !== userId && !isNil(oldQueueId) && !isNil(queueId) && ticket.whatsapp.status === 'CONNECTED') {

            const wbot = await GetTicketWbot(ticket);
            const msgtxt = formatBody(`\u200e ${settings.transferMessage.replace("${queue.name}", queue?.name)}`, ticket);
            // const msgtxt = `\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o departamento *${queue?.name}"*\nAguarde um momento, iremos atende-lo(a)!`;

            const queueChangedMessage = await wbot.sendMessage(
              `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: msgtxt
              }
            );
            await verifyMessage(queueChangedMessage, ticket, ticket.contact, ticketTraking);
          }
          // else
          //   // Mensagem de transferencia do ATENDENTE
          //   if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId) && (!ticket.isGroup || groupAsTicket === "enabled")) {
          //     const wbot = await GetTicketWbot(ticket);
          //     const nome = await ShowUserService(ticketData.userId, companyId);
          //     const msgtxt = `\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o atendente *${nome.name}*\nAguarde um momento, iremos atende-lo(a)!`;

          //     const queueChangedMessage = await wbot.sendMessage(
          //       `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //       {
          //         text: msgtxt
          //       }
          //     );
          //     await verifyMessage(queueChangedMessage, ticket, ticket.contact, ticketTraking);
          //   }
          //   else
          //     // Mensagem de transferencia do ATENDENTE e da FILA
          //     if (oldUserId !== userId && oldQueueId !== queueId && !isNil(oldUserId) && !isNil(userId) && (!ticket.isGroup || groupAsTicket === "enabled")) {
          //       const wbot = await GetTicketWbot(ticket);
          //       const nome = await ShowUserService(ticketData.userId, companyId);
          //       const msgtxt = `\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o departamento *${queue?.name}* e será atendido por *${nome.name}*\nAguarde um momento, iremos atende-lo(a)!`;

          //       const queueChangedMessage = await wbot.sendMessage(
          //         `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //         {
          //           text: msgtxt
          //         }
          //       );
          //       await verifyMessage(queueChangedMessage, ticket, ticket.contact);
          //     } else
          //       if (oldUserId !== undefined && isNil(userId) && oldQueueId !== queueId && !isNil(queueId)) {

          //         const wbot = await GetTicketWbot(ticket);
          //         const msgtxt = "\u200e*Mensagem Automática*:\nVocê foi transferido(a) para o departamento *" + queue?.name + "*\nAguarde um momento, iremos atende-lo(a)!";

          //         const queueChangedMessage = await wbot.sendMessage(
          //           `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          //           {
          //             text: msgtxt
          //           }
          //         );
          //         await verifyMessage(queueChangedMessage, ticket, ticket.contact);
          //       }
        }

        if (!isNil(msgTransfer)) {
          const messageData = {
            wid: `PVT${ticket.updatedAt.toString().replace(' ', '')}`,
            ticketId: ticket.id,
            contactId: undefined,
            body: msgTransfer,
            fromMe: true,
            mediaType: 'extendedTextMessage',
            read: true,
            quotedMsgId: null,
            ack: 2,
            remoteJid: ticket.contact?.remoteJid,
            participant: null,
            dataJson: null,
            ticketTrakingId: null,
            isPrivate: true
          };

          await CreateMessageService({ messageData, companyId: ticket.companyId });
        }

        if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId)) {
          //transferiu o atendimento para fila
          await CreateLogTicketService({
            userId: oldUserId,
            queueId: oldQueueId,
            ticketId,
            type: "transfered"
          });

        } else
          if (oldUserId !== userId && oldQueueId === queueId && !isNil(oldUserId) && !isNil(userId)) {
            //transferiu o atendimento para atendente na mesma fila
            await CreateLogTicketService({
              userId: oldUserId,
              queueId: oldQueueId,
              ticketId,
              type: "transfered"
            });
            //recebeu atendimento
            await CreateLogTicketService({
              userId,
              queueId: oldQueueId,
              ticketId: ticket.id,
              type: "receivedTransfer"
            });
          } else
            if (oldUserId !== userId && oldQueueId !== queueId && !isNil(oldUserId) && !isNil(userId)) {
              //transferiu o atendimento para fila e atendente

              await CreateLogTicketService({
                userId: oldUserId,
                queueId: oldQueueId,
                ticketId,
                type: "transfered"
              });
              //recebeu atendimento
              await CreateLogTicketService({
                userId,
                queueId,
                ticketId: ticket.id,
                type: "receivedTransfer"
              });
            } else
              if (oldUserId !== undefined && isNil(userId) && oldQueueId !== queueId && !isNil(queueId)) {
                await CreateLogTicketService({
                  userId: oldUserId,
                  queueId: oldQueueId,
                  ticketId,
                  type: "transfered"
                });
              }

        // if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
        //   await ticketTraking.update({
        //     userId: ticket.userId
        //   })

        //   io.to(oldStatus).emit(`company-${companyId}-ticket`, {
        //     action: "delete",
        //     ticketId: ticket.id
        //   });
        // }

        // io.to(ticket.status)
        //   .to("notification")
        //   .to(ticket.id.toString())
        //   .emit(`company-${companyId}-ticket`, {
        //     action: "update",
        //     ticket: ticket
        //   });

        // return { ticket, oldStatus, oldUserId };
      }
    }

    status = queue && queue.closeTicket ? "closed" : status;

    await ticket.update({
      status,
      queueId,
      userId,
      isBot,
      queueOptionId,
      amountUsedBotQueues: status === "closed" ? 0 : amountUsedBotQueues ? amountUsedBotQueues : ticket.amountUsedBotQueues,
      lastMessage: lastMessage ? lastMessage : ticket.lastMessage,
      useIntegration,
      integrationId,
      typebotSessionId: !useIntegration ? null : ticket.typebotSessionId,
      typebotStatus: useIntegration,
      unreadMessages
    });

    ticketTraking.queuedAt = moment().toDate();
    ticketTraking.queueId = queueId;

    await ticket.reload();

    // ticket = await ShowTicketService(ticket.id, companyId)

    if (status !== undefined && ["pending"].indexOf(status) > -1) {
      //ticket voltou para fila
      await CreateLogTicketService({
        userId: oldUserId,
        ticketId,
        type: "pending"
      });

      await ticketTraking.update({
        whatsappId: ticket.whatsappId,
        startedAt: null,
        userId: null
      });
    }

    if (status !== undefined && ["open"].indexOf(status) > -1) {
      await ticketTraking.update({
        startedAt: moment().toDate(),
        ratingAt: null,
        rated: false,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId,
        queueId: ticket.queueId
      });

      //loga inicio de atendimento
      await CreateLogTicketService({
        userId: userId,
        queueId: ticket.queueId,
        ticketId,
        type: oldStatus === "pending" ? "open" : "reopen"
      });

    }

    await ticketTraking.save();


    if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId || ticket.queueId !== oldQueueId) {
      // console.log("emitiu socket 739", ticket.id)

      io.of(String(companyId))
        // .to(oldStatus)
        .emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticketId: ticket.id
        });
    }
    // console.log("emitiu socket 746", ticket.id)

    io.of(String(companyId))
      // .to(ticket.status)
      // .to("notification")
      // .to(ticketId.toString())
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      });


    return { ticket, oldStatus, oldUserId };
  } catch (err) {
    console.log("erro ao atualizar o ticket", ticketId, "ticketData", ticketData)
    Sentry.captureException(err);
  }
};

export default UpdateTicketService;