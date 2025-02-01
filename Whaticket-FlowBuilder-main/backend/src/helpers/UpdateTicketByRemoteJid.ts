import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { Op } from "sequelize";
import { getIO } from "../libs/socket";
import Contact from "../models/Contact";
import User from "../models/User";
import Queue from "../models/Queue";
import Whatsapp from "../models/Whatsapp";
import Tag from "../models/Tag";


export const updateTicketByRemoteJid = async (remoteJid: string, queue: number, user: number, statusText: string, unread: number): Promise<Response> => {

  const { rows: messages } = await Message.findAndCountAll({
    limit: 1,
    order: [["createdAt", "DESC"]],
    where: {
      remoteJid: {
        [Op.like]: `%${remoteJid}%`
      }

    }
  }
  )

  messages.forEach(async (message) => {

    let ticketId = message.ticketId;
    let ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"],
          include: ["extraInfo", "tags",
            {
              association: "wallets",
              attributes: ["id", "name"]
            }]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"]
        },
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name", "color"]
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["name"]
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "color"]
        }
      ]
    });
    const oldStatus = ticket.status;
    const oldUserId = ticket.user?.id;
    await ticket.update({ status: statusText, queueId: queue, userId: user, unreadMessages: unread });


    const io = getIO();

    // io.to(oldStatus).emit(`company-${ticket.companyId}-ticket`, {
    //   action: "delete",
    //   ticketId: ticket.id
    // });

    io.of(ticket.companyId.toString())
      // .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket
      });


  });
  return
}