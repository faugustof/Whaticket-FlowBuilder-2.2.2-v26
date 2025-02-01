import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import { getIO } from "../../libs/socket";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  lastFlowId?: string;
  dataWebhook?: {};
  hashFlowId?: string;
  flowStopped?: string;
}

const CreateTicketServiceWebhook = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
  lastFlowId,
  dataWebhook,
  hashFlowId,
  flowStopped
}: Request): Promise<Ticket> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  await CheckContactOpenTickets(contactId, 0, companyId);

  const isGroup = false;

  const [{ id }] = await Ticket.findOrCreate({
    where: {
      contactId,
      companyId
    },
    defaults: {
      contactId,
      companyId,
      whatsappId: defaultWhatsapp.id,
      status,
      isGroup,
      userId,
      flowWebhook: true,
      dataWebhook: dataWebhook,
      hashFlowId: hashFlowId,
      flowStopped: flowStopped
    }
  });

  await Ticket.update(
    {
      companyId,
      queueId,
      userId,
      whatsappId: defaultWhatsapp.id,
      status: "open",
      flowWebhook: true,
      lastFlowId: lastFlowId,
      flowStopped: flowStopped
    },
    { where: { id } }
  );

  const ticket = await Ticket.findByPk(id, { include: ["contact", "queue"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  const io = getIO();

  io.to(ticket.id.toString()).emit("ticket", {
    action: "update",
    ticket
  });

  return ticket;
};

export default CreateTicketServiceWebhook;
