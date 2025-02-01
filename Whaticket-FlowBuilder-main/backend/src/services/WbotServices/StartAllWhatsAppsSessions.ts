import ListWhatsAppsService from "../WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import * as Sentry from "@sentry/node";

export const StartAllWhatsAppsSessions = async (
  companyId: number
): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId });
    if (whatsapps.length > 0) {
      const promises = whatsapps.map(async (whatsapp) => {
        if (whatsapp.channel === "whatsapp" && whatsapp.status !== "DISCONNECTED") {
          return StartWhatsAppSession(whatsapp, companyId);
        }
      });
      // Aguardar a resolução de todas as promessas
      await Promise.all(promises);
    }

    // fechar os tickets automaticamente
    // if (whatsapps.length > 0) {
    //   whatsapps.forEach(whatsapp => {
    //     const timeClosed = whatsapp.expiresTicket ? (((whatsapp.expiresTicket * 60) * 60) * 1000) : 500000;
    //     setInterval(() => {
    //       ClosedAllOpenTickets();
    //     }, timeClosed);
    //   });
    // }

  } catch (e) {
    Sentry.captureException(e);
  }
};
