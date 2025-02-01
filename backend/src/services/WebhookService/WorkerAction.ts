import { parentPort } from "worker_threads";
import { ActionsWebhookService } from "./ActionsWebhookService";

parentPort.on("message", async data => {
  // Extrair as variáveis da mensagem
  const {
    idFlowDb,
    companyId,
    nodes,
    connects,
    nextStage,
    dataWebhook,
    details,
    hashWebhookId,
    pressKey,
    idTicket,
    numberPhrase
  } = data;

  // Chame a função sendMail dentro do worker com as variáveis
  if (typeof data === 'object') {
    await ActionsWebhookService(
      idFlowDb,
      companyId,
      nodes,
      connects,
      nextStage,
      dataWebhook,
      details,
      hashWebhookId,
      pressKey,
      idTicket,
      numberPhrase
    );
  }

  // Enviar uma mensagem de volta para o thread principal
  parentPort.postMessage("Olá, thread principal!");
});
