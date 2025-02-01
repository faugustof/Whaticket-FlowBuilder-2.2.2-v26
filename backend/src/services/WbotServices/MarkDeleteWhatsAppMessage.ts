import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CompaniesSettings from "../../models/CompaniesSettings";

const MarkDeleteWhatsAppMessage = async (from: any, timestamp?: any, msgId?: string, companyId?: number): Promise<Message> => {

    from = from.replace('@c.us', '').replace('@s.whatsapp.net', '')

    if (msgId) {

        const messages = await Message.findAll({
            where: {
                wid: msgId,
                companyId
            }
        });

        try {
            const messageToUpdate = await Message.findOne({
                where: {
                    wid: messages[0].wid,
                },
                include: [
                    "contact",
                    {
                        model: Message,
                        as: "quotedMsg",
                        include: ["contact"]
                    }
                ]
            });

            if (messageToUpdate) {
                const settings = await CompaniesSettings.findOne({
                    where: {
                        companyId: companyId
                    }
                });

                const ticket = await Ticket.findOne({
                    where: {
                        id: messageToUpdate.ticketId,
                        companyId
                    }
                })

                if (settings.lgpdDeleteMessage === "enabled" && settings.enableLGPD === "enabled") {

                    await messageToUpdate.update({ body: "🚫 _Mensagem Apagada_", isDeleted: true });

                } else {
                    await messageToUpdate.update({ isDeleted: true });

                }

                await UpdateTicketService({ ticketData: { lastMessage: "🚫 _Mensagem Apagada_" }, ticketId: ticket.id, companyId })

                const io = getIO();
                io.of(String(companyId))
                    // .to(messageToUpdate.ticketId.toString())
                    .emit(`appMessage-${messageToUpdate}`, {
                        action: "update",
                        message: messageToUpdate
                    });
            }
        } catch (err) {
            console.log("Erro ao tentar marcar a mensagem com excluída")
        }

        return timestamp;
    };

}

export default MarkDeleteWhatsAppMessage;