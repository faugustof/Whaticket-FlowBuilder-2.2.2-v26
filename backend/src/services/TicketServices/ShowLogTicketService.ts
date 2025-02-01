import LogTicket from "../../models/LogTicket";
import User from "../../models/User";
import Queue from "../../models/Queue";

interface Request {
  ticketId: string | number;
  companyId: string | number;
}

const ShowLogTicketService = async ({
  ticketId,
  companyId
}: Request): Promise<LogTicket[]> => {
  
  const logs = await LogTicket.findAll({
    where: {
      ticketId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return logs;
};

export default ShowLogTicketService;
