import { getWbot } from "../libs/wbot";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";

export default {
    key: `${process.env.DB_NAME}-handleMessage`,

    async handle({ data }) {
        try {
            const { message, wbot, companyId } = data;

            if (message === undefined || wbot === undefined || companyId === undefined) {
                console.log("message, wbot, companyId", message, wbot, companyId)
            }

            const w = getWbot(wbot);

            if (!w) {
                console.log("wbot not found", wbot)
            }

            try {
                await handleMessage(message, w, companyId);
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            console.log("error", error)
        }
    },
};
