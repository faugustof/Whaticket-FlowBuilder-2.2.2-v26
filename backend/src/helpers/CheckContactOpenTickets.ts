import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Queue from "../models/Queue";

const CheckContactOpenTickets = async (contactId, whatsappId, companyId): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { contactId, whatsappId, companyId, status: { [Op.or]: ["open", "pending"] } }
  });

  if (ticket) {
    throw new AppError("ERR_OTHER_OPEN_TICKET");
  }
};

export default CheckContactOpenTickets;
