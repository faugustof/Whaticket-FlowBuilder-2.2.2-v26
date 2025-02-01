import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";

const CheckContactSomeTickets = async (
  contactId: number,
  companyId: number,
  whatsappId: number
): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { contactId, companyId, whatsappId }
  });

  if (ticket) {
    throw new AppError("ERR_OTHER_OPEN_TICKET");
  }
};

export default CheckContactSomeTickets;
