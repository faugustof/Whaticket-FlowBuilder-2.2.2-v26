import AppError from "../../errors/AppError";
import { WebhookModel } from "../../models/Webhook";
import { sendMessageFlow } from "../../controllers/MessageController";
import { IConnections, INodes } from "./DispatchWebHookService";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import CreateContactService from "../ContactServices/CreateContactService";
import Contact from "../../models/Contact";
import CreateTicketService from "../TicketServices/CreateTicketService";
import CreateTicketServiceWebhook from "../TicketServices/CreateTicketServiceWebhook";
import { SendMessage } from "../../helpers/SendMessage";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import fs from "fs";
import GetWhatsappWbot from "../../helpers/GetWhatsappWbot";
import path from "path";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMediaFlow from "../WbotServices/SendWhatsAppMediaFlow";
import { randomizarCaminho } from "../../utils/randomizador";
import { SendMessageFlow } from "../../helpers/SendMessageFlow";
import formatBody from "../../helpers/Mustache";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowTicketService from "../TicketServices/ShowTicketService";
import CreateMessageService, {
  MessageData
} from "../MessageServices/CreateMessageService";
import { randomString } from "../../utils/randomCode";
import ShowQueueService from "../QueueService/ShowQueueService";
import { getIO } from "../../libs/socket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import ShowTicketUUIDService from "../TicketServices/ShowTicketFromUUIDService";
import logger from "../../utils/logger";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import CompaniesSettings from "../../models/CompaniesSettings";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface IAddContact {
  companyId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  dataMore?: any;
}

export const ActionsWebhookService = async (
  whatsappId: number,
  idFlowDb: number,
  companyId: number,
  nodes: INodes[],
  connects: IConnections[],
  nextStage: string,
  dataWebhook: any,
  details: any,
  hashWebhookId: string,
  pressKey?: string,
  idTicket?: number,
  numberPhrase: "" | { number: string; name: string; email: string } = ""
): Promise<string> => {
  try {
    const io = getIO()
    let next = nextStage;
    console.log('ActionWebhookService | 53', idFlowDb, companyId, nodes, connects, nextStage, dataWebhook, details, hashWebhookId, pressKey, idTicket, numberPhrase)
    let createFieldJsonName = "";

    const connectStatic = connects;
    if (numberPhrase === "") {
      const nameInput = details.inputs.find(item => item.keyValue === "nome");
      nameInput.data.split(",").map(dataN => {
        const lineToData = details.keysFull.find(item => item === dataN);
        let sumRes = "";
        if (!lineToData) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToData, dataWebhook);
        }
        createFieldJsonName = createFieldJsonName + sumRes
      });
    } else {
      createFieldJsonName = numberPhrase.name;
    }


    let numberClient = "";

    if (numberPhrase === "") {
      const numberInput = details.inputs.find(
        item => item.keyValue === "celular"
      );

      numberInput.data.split(",").map(dataN => {
        const lineToDataNumber = details.keysFull.find(item => item === dataN);
        let createFieldJsonNumber = "";
        if (!lineToDataNumber) {
          createFieldJsonNumber = dataN;
        } else {
          createFieldJsonNumber = constructJsonLine(
            lineToDataNumber,
            dataWebhook
          );
        }

        numberClient = numberClient + createFieldJsonNumber;
      });
    } else {
      numberClient = numberPhrase.number;
    }


    numberClient = removerNaoLetrasNumeros(numberClient);

    if (numberClient.substring(0, 2) === "55") {
      if (parseInt(numberClient.substring(2, 4)) >= 31) {
        if (numberClient.length === 13) {
          numberClient =
            numberClient.substring(0, 4) + numberClient.substring(5, 13);
        }
      }
    }

    let createFieldJsonEmail = "";

    if (numberPhrase === "") {
      const emailInput = details.inputs.find(item => item.keyValue === "email");
      emailInput.data.split(",").map(dataN => {

        const lineToDataEmail = details.keysFull.find(item =>
          item.endsWith("email")
        );

        let sumRes = "";
        if (!lineToDataEmail) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToDataEmail, dataWebhook);
        }

        createFieldJsonEmail = createFieldJsonEmail + sumRes;
      });
    } else {
      createFieldJsonEmail = numberPhrase.email;
    }



    const lengthLoop = nodes.length;
    const whatsapp = await GetDefaultWhatsApp(whatsappId, companyId);

    if (whatsapp.status !== "CONNECTED") {
      return;
    }

    let execCount = 0;

    let execFn = "";

    let ticket = null;

    let noAlterNext = false;


    for (var i = 0; i < lengthLoop; i++) {
      let nodeSelected: any;
      let ticketInit: Ticket;
      if (idTicket) {
        console.log("UPDATE1...");
        ticketInit = await Ticket.findOne({
          where: { id: idTicket, whatsappId }
        });

        if (ticketInit.status === "closed") {
          if (numberPhrase === "") {
            break;
          }
        }

      }

      if (pressKey) {
        console.log("UPDATE2...");
        if (pressKey === "parar") {
          console.log("UPDATE3...");
          if (idTicket) {
            console.log("UPDATE4...");
            ticketInit = await Ticket.findOne({
              where: { id: idTicket, whatsappId }
            });
            await ticket.update({
              status: "closed"
            });
          }
          break;
        }

        if (execFn === "") {
          console.log("UPDATE5...");
          nodeSelected = {
            type: "menu"
          };
        } else {
          console.log("UPDATE6...");
          nodeSelected = nodes.filter(node => node.id === execFn)[0];
        }
      } else {
        console.log("UPDATE7...");
        const otherNode = nodes.filter((node) => node.id === next)[0]
        if (otherNode) {
          nodeSelected = otherNode;
        }
      }

      if (nodeSelected.type === "message") {
        let msg;
        if (dataWebhook === "") {
          msg = {
            body: nodeSelected.data.label,
            number: numberClient,
            companyId: companyId
          };
        } else {
          const dataLocal = {
            nome: createFieldJsonName,
            numero: numberClient,
            email: createFieldJsonEmail
          };
          msg = {
            body: replaceMessages(
              nodeSelected.data.label,
              details,
              dataWebhook,
              dataLocal
            ),
            number: numberClient,
            companyId: companyId
          };
        }

        await SendMessage(whatsapp, {
          number: numberClient,
          body: msg.body
        });
        //TESTE BOTÃO
        //await SendMessageFlow(whatsapp, {
        //  number: numberClient,
        //  body: msg.body
        //} )
        await intervalWhats("1");
      }

      if (nodeSelected.type === "ticket") {
        const queue = await ShowQueueService(nodeSelected.data.data.id, companyId)


        await ticket.update({
          status: 'pending',
          queueId: queue.id,
          userId: ticket.userId,
          companyId: companyId,
          flowWebhook: true,
          lastFlowId: nodeSelected.id,
          hashFlowId: hashWebhookId,
          flowStopped: idFlowDb.toString()
        });

        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        })

       

        await UpdateTicketService({
          ticketData: {
            status: "pending",
            queueId: queue.id
          },
          ticketId: ticket.id,
          companyId
        })


        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "queue",
          queueId: queue.id
        });

        let settings = await CompaniesSettings.findOne({
          where: {
            companyId: companyId
          }
        })

        const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(whatsappId, companyId);

        if(greetingMessage.length > 1 ){
          const body = formatBody(`${greetingMessage}`, ticket);

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          await ticketDetails.update({
            lastMessage: formatBody(queue.greetingMessage, ticket.contact)
          });

          await SendWhatsAppMessage({
            body,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);
        }


      }


      if (nodeSelected.type === "singleBlock") {
        for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
        
          const elementNowSelected = nodeSelected.data.seq[iLoc];
          if (elementNowSelected.includes("message")) {
            // await SendMessageFlow(whatsapp, {
            //   number: numberClient,
            //   body: nodeSelected.data.elements.filter(
            //     item => item.number === elementNowSelected
            //   )[0].value
            // });
            const bodyFor = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            let msg;

            if (dataWebhook === "") {
              msg = bodyFor;
            } else {
              const dataLocal = {
                nome: createFieldJsonName,
                numero: numberClient,
                email: createFieldJsonEmail
              };
              msg = replaceMessages(bodyFor, details, dataWebhook, dataLocal);
            }

            await SendWhatsAppMessage({
              body: msg,
              ticket: ticketDetails,
              quotedMsg: null
            });

            SetTicketMessagesAsRead(ticketDetails);

            await ticketDetails.update({
              lastMessage: formatBody(bodyFor, ticket.contact)
            });
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("interval")) {
            await intervalWhats(
              nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].value
            );
          }
          if (elementNowSelected.includes("img")) {
            await SendMessage(whatsapp, {
              number: numberClient,
              body: "",
              mediaPath:
                process.env.BACKEND_URL === "http://localhost:8090"
                  ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                    item => item.number === elementNowSelected
                  )[0].value
                  }`
                  : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                    item => item.number === elementNowSelected
                  )[0].value
                  }`
            });
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("audio")) {
            const mediaDirectory =
              process.env.BACKEND_URL === "http://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                  item => item.number === elementNowSelected
                )[0].value
                }`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                  item => item.number === elementNowSelected
                )[0].value
                }`;
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });
            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt,
              isRecord: nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].record
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("video")) {
            const mediaDirectory =
              process.env.BACKEND_URL === "http://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                  item => item.number === elementNowSelected
                )[0].value
                }`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                  item => item.number === elementNowSelected
                )[0].value
                }`;
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });
            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }
        }
      }


      let isRandomizer: boolean;
      if (nodeSelected.type === "randomizer") {
        const selectedRandom = randomizarCaminho(nodeSelected.data.percent / 100);

        const resultConnect = connects.filter(
          connect => connect.source === nodeSelected.id
        );
        if (selectedRandom === "A") {
          next = resultConnect.filter(item => item.sourceHandle === "a")[0]
            .target;
          noAlterNext = true;
        } else {
          next = resultConnect.filter(item => item.sourceHandle === "b")[0]
            .target;
          noAlterNext = true;
        }
        isRandomizer = true;
      }

      let isMenu: boolean;

      if (nodeSelected.type === "menu") {

        /*
        if(ticket){
          await ticket.update({
            repeatMessage: 0
          })
          
        }
        */

        if (pressKey) {

          const filterOne = connectStatic.filter(confil => confil.source === next)
          const filterTwo = filterOne.filter(filt2 => filt2.sourceHandle === "a" + pressKey)
          if (filterTwo.length > 0) {
            execFn = filterTwo[0].target
          } else {
            execFn = undefined
          }
          // execFn =
          //   connectStatic
          //     .filter(confil => confil.source === next)
          //     .filter(filt2 => filt2.sourceHandle === "a" + pressKey)[0]?.target ??
          //   undefined;
          if (execFn === undefined) {
            break;
          }
          pressKey = "999";

          const isNodeExist = nodes.filter(item => item.id === execFn);

          if (isNodeExist.length > 0) {
            isMenu = isNodeExist[0].type === "menu" ? true : false;
          } else {
            isMenu = false;
          }
        } else {
          let optionsMenu = "";
          nodeSelected.data.arrayOption.map(item => {
            optionsMenu += `[${item.number}] ${item.value}\n`;
          });

          const menuCreate = `${nodeSelected.data.message}\n\n${optionsMenu}`;

          let msg;
          if (dataWebhook === "") {
            msg = {
              body: menuCreate,
              number: numberClient,
              companyId: companyId
            };
          } else {
            const dataLocal = {
              nome: createFieldJsonName,
              numero: numberClient,
              email: createFieldJsonEmail
            };
            msg = {
              body: replaceMessages(menuCreate, details, dataWebhook, dataLocal),
              number: numberClient,
              companyId: companyId
            };
          }

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          const messageData: MessageData = {
            wid: randomString(50),
            ticketId: ticket.id,
            body: msg.body,
            fromMe: true,
            read: true
          };

          //await CreateMessageService({ messageData: messageData, companyId });

          //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })

          // await SendMessage(whatsapp, {
          //   number: numberClient,
          //   body: msg.body
          // });

          await SendWhatsAppMessage({
            body: msg.body,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: formatBody(msg.body, ticket.contact)
          });
          await intervalWhats("1");

          if (ticket) {
            ticket = await Ticket.findOne({
              where: { id: ticket.id, whatsappId: whatsappId, companyId: companyId }
            });
          } else {
            ticket = await Ticket.findOne({
              where: { id: idTicket, whatsappId: whatsappId, companyId: companyId }
            });
          }

          if (ticket) {
            await ticket.update({
              status: "pending",
              queueId: ticket.queueId ? ticket.queueId : null,
              userId: null,
              companyId: companyId,
              flowWebhook: true,
              lastFlowId: nodeSelected.id,
              dataWebhook: dataWebhook,
              hashFlowId: hashWebhookId,
              flowStopped: idFlowDb.toString()
            });
          }

          break;
        }
      }

      let isContinue = false;

      if (pressKey === "999" && execCount > 0) {
        console.log("UPDATE8...");
        pressKey = undefined;
        let result = connects.filter(connect => connect.source === execFn)[0];
        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      } else {
        let result;

        if (isMenu) {
          result = { target: execFn };
          isContinue = true;
          pressKey = undefined;
        } else if (isRandomizer) {
          isRandomizer = false;
          result = next;
        } else {
          result = connects.filter(connect => connect.source === next)[0];
        }

        if (typeof result === "undefined") {
          next = "";
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      }

      if (!pressKey && !isContinue) {
        const nextNode = connects.filter(
          connect => connect.source === nodeSelected.id
        ).length;

        if (nextNode === 0) {
          if (ticket) {
            ticket = await Ticket.findOne({
              where: { id: ticket.id, whatsappId, companyId: companyId }
            });
            await ticket.update({
              lastFlowId: null,
              dataWebhook: null,
              hashFlowId: null,
              flowWebhook: false,
              flowStopped: idFlowDb.toString()
            });

          } else {
            ticket = await Ticket.findOne({
              where: { id: idTicket, whatsappId, companyId: companyId }
            });
            await ticket.update({
              lastFlowId: null,
              dataWebhook: null,
              hashFlowId: null,
              flowWebhook: false,
              flowStopped: idFlowDb.toString()
            });
          }
          break;
        }
      }

      isContinue = false;

      if (next === "") {
        break;
      }

      console.log("UPDATE9...");
      if (idTicket) {
        console.log("UPDATE10...");
        ticket = await Ticket.findOne({
          where: { id: idTicket, whatsappId, companyId: companyId }
        });
      }

      console.log("UPDATE12...");
      await ticket.update({
        whatsappId: whatsappId,
        queueId: ticket?.queueId,
        userId: null,
        companyId: companyId,
        flowWebhook: true,
        lastFlowId: nodeSelected.id,
        dataWebhook: dataWebhook,
        hashFlowId: hashWebhookId,
        flowStopped: idFlowDb.toString()
      });

      noAlterNext = false;
      execCount++;
    }

    return "ds";
  } catch (error) {
    logger.error(error)
  }
};

const constructJsonLine = (line: string, json: any) => {
  let valor = json
  const chaves = line.split(".")

  if (chaves.length === 1) {
    return valor[chaves[0]]
  }

  for (const chave of chaves) {
    valor = valor[chave]
  }
  return valor
};


function removerNaoLetrasNumeros(texto: string) {
  // Substitui todos os caracteres que não são letras ou números por vazio
  return texto.replace(/[^a-zA-Z0-9]/g, "");
}

const sendMessageWhats = async (
  whatsId: number,
  msg: any,
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
) => {
  sendMessageFlow(whatsId, msg, req);
  return Promise.resolve();
};

const intervalWhats = (time: string) => {
  const seconds = parseInt(time) * 1000;
  return new Promise(resolve => setTimeout(resolve, seconds));
};



const replaceMessages = (
  message: string,
  details: any,
  dataWebhook: any,
  dataNoWebhook?: any
) => {
  const matches = message.match(/\{([^}]+)\}/g);


  if (dataWebhook) {
    let newTxt = message.replace(/{+nome}+/, dataNoWebhook.nome);
    newTxt = newTxt.replace(/{+numero}+/, dataNoWebhook.numero);
    newTxt = newTxt.replace(/{+email}+/, dataNoWebhook.email);
    return newTxt;
  }

  if (matches && matches.includes("inputs")) {
    const placeholders = matches.map(match => match.replace(/\{|\}/g, ""));
    let newText = message;
    placeholders.map(item => {
      const value = details["inputs"].find(
        itemLocal => itemLocal.keyValue === item
      );
      const lineToData = details["keysFull"].find(itemLocal =>
        itemLocal.endsWith(`.${value.data}`)
      );
      const createFieldJson = constructJsonLine(lineToData, dataWebhook);
      newText = newText.replace(`{${item}}`, createFieldJson);
    });
    return newText;
  } else {
    return message;
  }



};