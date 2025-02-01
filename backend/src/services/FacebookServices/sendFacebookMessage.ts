import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { sendText } from "./graphAPI";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const sendFacebookMessage = async ({ body, ticket, quotedMsg }: Request): Promise<any> => {
  const { number } = ticket.contact;
  try {

    const send = await sendText(
      number,
      formatBody(body, ticket),
      ticket.whatsapp.facebookUserToken
    );

    await ticket.update({ lastMessage: body });

    return send;

  } catch (err) {
    console.log(err)
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export default sendFacebookMessage;
