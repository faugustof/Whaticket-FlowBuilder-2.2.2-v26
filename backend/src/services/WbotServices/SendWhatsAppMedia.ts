import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs, { unlink, unlinkSync } from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";
import { getWbot } from "../../libs/wbot";
import CreateMessageService from "../MessageServices/CreateMessageService";
import formatBody from "../../helpers/Mustache";
interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId?: number;
  body?: string;
  isPrivate?: boolean;
  isForwarded?: boolean;
}
const os = require("os");

// let ffmpegPath;
// if (os.platform() === "win32") {
//   // Windows
//   ffmpegPath = "C:\\ffmpeg\\ffmpeg.exe"; // Substitua pelo caminho correto no Windows
// } else if (os.platform() === "darwin") {
//   // macOS
//   ffmpegPath = "/opt/homebrew/bin/ffmpeg"; // Substitua pelo caminho correto no macOS
// } else {
//   // Outros sistemas operacionais (Linux, etc.)
//   ffmpegPath = "/usr/bin/ffmpeg"; // Substitua pelo caminho correto em sistemas Unix-like
// }

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio}  -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        // fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
  // return new Promise((resolve, reject) => {
  //   exec(
  //     `${ffmpegPath} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
  //     (error, _stdout, _stderr) => {
  //       if (error) reject(error);
  //       // fs.unlinkSync(audio);
  //       resolve(outputAudio);
  //     }
  //   );
  // });
};

const processAudioFile = async (audio: string, companyId: string): Promise<string> => {
  const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        // fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  companyId?: string,
  body: string = " "
): Promise<any> => {
  const mimeType = mime.lookup(pathMedia);
  const typeMessage = mimeType.split("/")[0];

  try {
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const typeAudio = true; //fileName.includes("audio-record-site");
      const convert = await processAudio(pathMedia, companyId);
      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          ptt: true
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeAudio ? "audio/mp4" : mimeType,
          ptt: true
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null,
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.log(e);
    return null;
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body = "",
  isPrivate = false,
  isForwarded = false
}: Request): Promise<WAMessage> => {
  try {
    const wbot = await getWbot(ticket.whatsappId);
    const companyId = ticket.companyId.toString()

    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    let options: AnyMessageContent;
    let bodyTicket = "";
    const bodyMedia = ticket ? formatBody(body, ticket) : body;

    // console.log(media.mimetype)
    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "🎥 Arquivo de vídeo"
    } else if (typeMessage === "audio") {
      
      const typeAudio = true; //media.originalname.includes("audio-record-site");
      if (typeAudio) {
        const convert = await processAudio(media.path, companyId);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mpeg",
          ptt: true,
          caption: bodyMedia,
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
        };
        unlinkSync(convert);
      } else {
        const convert = await processAudio(media.path, companyId);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mpeg",
          ptt: true,
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
        };
        unlinkSync(convert);
      }
      bodyTicket = "🎵 Arquivo de áudio"
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "📂 Documento"
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMedia,
        fileName: media.originalname.replace('/', '-'),
        mimetype: media.mimetype,
        contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
      };
      bodyTicket = "📎 Outros anexos"
    } else {
      if (media.mimetype.includes("gif")) {
        options = {
          image: fs.readFileSync(pathMedia),
          caption: bodyMedia,
          mimetype: "image/gif",
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
          gifPlayback: true

        };
      } else {
        options = {
          image: fs.readFileSync(pathMedia),
          caption: bodyMedia,
          contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
        };
      }
      bodyTicket = "📎 Outros anexos"
    }

    if (isPrivate === true) {
      const messageData = {
        wid: `PVT${companyId}${ticket.id}${body.substring(0, 6)}`,
        ticketId: ticket.id,
        contactId: undefined,
        body: bodyMedia,
        fromMe: true,
        mediaUrl: media.filename,
        mediaType: media.mimetype.split("/")[0],
        read: true,
        quotedMsgId: null,
        ack: 2,
        remoteJid: null,
        participant: null,
        dataJson: null,
        ticketTrakingId: null,
        isPrivate
      };

      await CreateMessageService({ messageData, companyId: ticket.companyId });

      return
    }

    const contactNumber = await Contact.findByPk(ticket.contactId)

    let number: string;

    if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
      number = contactNumber.remoteJid;
    } else {
      number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
        }`;
    }

    const sentMessage = await wbot.sendMessage(
      number,
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: body !== media.filename ? body : bodyMedia, imported: null });

    return sentMessage;
  } catch (err) {
    console.log(`ERRO AO ENVIAR MIDIA ${ticket.id} media ${media.originalname}`)
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
