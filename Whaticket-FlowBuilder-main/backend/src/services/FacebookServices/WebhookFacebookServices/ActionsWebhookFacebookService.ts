import Chatbot from "../../../models/Chatbot";
import Contact from "../../../models/Contact";
import Queue from "../../../models/Queue";
import Ticket from "../../../models/Ticket";
import Whatsapp from "../../../models/Whatsapp";
import ShowTicketService from "../../TicketServices/ShowTicketService";
import { IConnections, INodes } from "../../WebhookService/DispatchWebHookService"
import { getAccessToken, sendAttachmentFromUrl, sendText, showTypingIndicator } from "../graphAPI";
import formatBody from "../../../helpers/Mustache";
import axios from "axios";
import fs from "fs";
import { sendFacebookMessageMedia } from "../sendFacebookMessageMedia";
import mime from "mime";
import path from "path";
import { getIO } from "../../../libs/socket";
import { randomizarCaminho } from "../../../utils/randomizador";
import CreateLogTicketService from "../../TicketServices/CreateLogTicketService";
import UpdateTicketService from "../../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../../TicketServices/FindOrCreateATicketTrakingService";
import ShowQueueService from "../../QueueService/ShowQueueService";
import ffmpeg from "fluent-ffmpeg";
import { fi } from "date-fns/locale";
import queue from "../../../libs/queue";
const os = require("os");

let ffmpegPath;
if (os.platform() === "win32") {
    // Windows
    ffmpegPath = "C:\\ffmpeg\\ffmpeg.exe"; // Substitua pelo caminho correto no Windows
} else if (os.platform() === "darwin") {
    // macOS
    ffmpegPath = "/opt/homebrew/bin/ffmpeg"; // Substitua pelo caminho correto no macOS
} else {
    // Outros sistemas operacionais (Linux, etc.)
    ffmpegPath = "/usr/bin/ffmpeg"; // Substitua pelo caminho correto em sistemas Unix-like
}
ffmpeg.setFfmpegPath(ffmpegPath);


interface IAddContact {
    companyId: number;
    name: string;
    phoneNumber: string;
    email?: string;
    dataMore?: any;
}

interface NumberPhrase {
    number: string,
    name: string,
    email: string
}


export const ActionsWebhookFacebookService = async (
    token: Whatsapp,
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
    numberPhrase?: NumberPhrase
): Promise<string> => {

    const io = getIO()
    let next = nextStage;
    let createFieldJsonName = "";
    const connectStatic = connects;


    const lengthLoop = nodes.length;
    const getSession = await Whatsapp.findOne({
        where: {
            facebookPageUserId: token.facebookPageUserId
        },
        include: [
            {
                model: Queue,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage"],
                include: [
                    {
                        model: Chatbot,
                        as: "chatbots",
                        attributes: ["id", "name", "greetingMessage"]
                    }
                ]
            }
        ],
        order: [
            ["queues", "id", "ASC"],
            ["queues", "chatbots", "id", "ASC"]
        ]
    })

    let execCount = 0;

    let execFn = "";

    let ticket = null;

    let noAlterNext = false;

    let selectedQueueid = null;

    for (var i = 0; i < lengthLoop; i++) {
        let nodeSelected: any;
        let ticketInit: Ticket;
        if (idTicket) {
            ticketInit = await Ticket.findOne({
                where: { id: idTicket }
            });
            if (ticketInit.status === "closed") {
                if (numberPhrase === null || numberPhrase === undefined) {
                    break;
                }
            } else {
                await ticketInit.update({
                    dataWebhook: {
                        status: "process",
                    },
                })
            }
        }
        if (pressKey) {
            if (pressKey === "parar") {
                if (idTicket) {
                    const ticket = await Ticket.findOne({
                        where: { id: idTicket }
                    });
                    await ticket.update({
                        status: "closed"
                    });
                }
                break;
            }

            if (execFn === "") {
                nodeSelected = {
                    type: "menu"
                };
            } else {
                nodeSelected = nodes.filter(node => node.id === execFn)[0];
            }
        } else {
            const otherNode = nodes.filter(node => node.id === next)[0];
            if (otherNode) {
                nodeSelected = otherNode;
            }
        }

        if (nodeSelected.type === "ticket") {
            const queue = await ShowQueueService(nodeSelected.data.data.id, companyId)

            console.clear()
            console.log("====================================")
            console.log("              TICKET                ")
            console.log("====================================")

            selectedQueueid = queue.id;
            await updateQueueId(ticket, companyId, queue.id)

        }

        if (nodeSelected.type === "singleBlock") {

            for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
                const elementNowSelected = nodeSelected.data.seq[iLoc];
                console.log(elementNowSelected, "elementNowSelected")

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


                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    const bodyBot: string = formatBody(
                        `${bodyFor}`,
                        ticket
                    );

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sentMessage = await sendText(
                        contact.number,
                        bodyBot,
                        getSession.facebookUserToken);

                    await ticketDetails.update({
                        lastMessage: formatBody(bodyFor, ticket.contact)
                    });

                    await updateQueueId(ticket, companyId, selectedQueueid)

                    await intervalWhats("1");

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

                }


                if (elementNowSelected.includes("interval")) {
                    await intervalWhats(
                        nodeSelected.data.elements.filter(
                            item => item.number === elementNowSelected
                        )[0].value
                    );
                }


                if (elementNowSelected.includes("img")) {
                    const mediaPath = process.env.BACKEND_URL === "http://localhost:8090"
                        ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                            item => item.number === elementNowSelected
                        )[0].value
                        }`
                        : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(
                            item => item.number === elementNowSelected
                        )[0].value
                        }`

                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });


                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaPath);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaPath, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaPath);

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "image",
                        getSession.facebookUserToken
                    );

                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

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

                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaDirectory);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaDirectory);

                    const fileNotExists = path.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + ".mp4");

                    if (fileNotExists) {
                        const folder = path.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + fileExtension);
                        await convertAudio(folder)
                    }

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}.mp4`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "audio",
                        getSession.facebookUserToken
                    );


                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

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


                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaDirectory);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaDirectory);

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "video",
                        getSession.facebookUserToken
                    );

                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );
                }

            }
        }

        if (nodeSelected.type === "img") {
            const mediaPath = process.env.BACKEND_URL === "http://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url
                }`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url
                }`


            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaPath);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaPath, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaPath);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`

            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_on"
            );

            await intervalWhats("5");

            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "image",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_off"
            );
        }

        if (nodeSelected.type === "audio") {
            const mediaDirectory =
                process.env.BACKEND_URL === "http://localhost:8090"
                    ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url
                    }`
                    : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url
                    }`;

            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaDirectory);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaDirectory);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "audio",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });

            await intervalWhats("1");
        }
        if (nodeSelected.type === "interval") {
            await intervalWhats(nodeSelected.data.sec);
        }
        if (nodeSelected.type === "video") {
            const mediaDirectory =
                process.env.BACKEND_URL === "http://localhost:8090"
                    ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url
                    }`
                    : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url
                    }`;


            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaDirectory);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaDirectory);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_on"
            );

            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "video",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact),
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_off"
            );
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


                const ticketDetails = await ShowTicketService(ticket.id, companyId);


                //await CreateMessageService({ messageData: messageData, companyId });

                //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })

                // await SendMessage(whatsapp, {
                //   number: numberClient,
                //   body: msg.body
                // });


                await ticketDetails.update({
                    lastMessage: formatBody(menuCreate, ticket.contact)
                });

                const contact = await Contact.findOne({
                    where: { number: numberPhrase.number, companyId }
                });


                await showTypingIndicator(
                    contact.number,
                    getSession.facebookUserToken,
                    "typing_on"
                );

                await intervalWhats("5");

                await sendText(
                    numberPhrase.number,
                    menuCreate,
                    getSession.facebookUserToken
                );


                await showTypingIndicator(
                    contact.number,
                    getSession.facebookUserToken,
                    "typing_off"
                );

                ticket = await Ticket.findOne({
                    where: { id: idTicket, companyId: companyId }
                });


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

                break;
            }
        }

        let isContinue = false;

        if (pressKey === "999" && execCount > 0) {
            pressKey = undefined;
            let result = connects.filter(connect => connect.source === execFn)[0];
            if (typeof result === "undefined") {
                next = "";
            } else {
                if (!noAlterNext) {
                    await ticket.reload();

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
                console.log(512, "ActionsWebhookFacebookService")
            }

            if (typeof result === "undefined") {
                console.log(517, "ActionsWebhookFacebookService")
                next = "";
            } else {
                if (!noAlterNext) {
                    console.log(520, "ActionsWebhookFacebookService")
                    next = result.target;
                }
            }
        }

        if (!pressKey && !isContinue) {
            const nextNode = connects.filter(
                connect => connect.source === nodeSelected.id
            ).length;
            console.log(530, "ActionsWebhookFacebookService")
            if (nextNode === 0) {
                console.log(532, "ActionsWebhookFacebookService")

                const ticket = await Ticket.findOne({
                    where: { id: idTicket, companyId: companyId }
                });

                await ticket.update({
                    lastFlowId: null,
                    dataWebhook: {
                        status: "process",
                    },
                    queueId: ticket.queueId ? ticket.queueId : null,
                    hashFlowId: null,
                    flowWebhook: false,
                    flowStopped: idFlowDb.toString()
                });

                await ticket.reload();

                break;
            }
        }

        isContinue = false;

        if (next === "") {
            break;
        }


        ticket = await Ticket.findOne({
            where: { id: idTicket, companyId: companyId }
        });

        await ticket.update({
            queueId: null,
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
}

async function updateQueueId(ticket: Ticket, companyId: number, queueId: number) {
    await ticket.update({
        status: 'pending',
        queueId: queueId,
        userId: ticket.userId,
        companyId: companyId,
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
            queueId: queueId 
        },
        ticketId: ticket.id,
        companyId
    })


    await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: queueId
    });

}

function convertAudio(inputFile: string): Promise<string> {
    let outputFile: string;


    if (inputFile.endsWith(".mp3")) {
        outputFile = inputFile.replace(".mp3", ".mp4");
    }

    console.log("output", outputFile);


    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .toFormat('mp4')
            .save(outputFile)
            .on('end', () => {
                resolve(outputFile);
            })
            .on('error', (err) => {
                console.error('Error during conversion:', err);
                reject(err);
            });
    });

}
