import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

interface RequestFlow {
  media: string;
  ticket: Ticket;
  body?: string;
  isFlow?: boolean;
  isRecord?: boolean;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        //fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, _stdout, _stderr) => {
        if (error) reject(error);
        //fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const nameFileDiscovery = (pathMedia: string) => {
  const spliting = pathMedia.split('/')
  const first = spliting[spliting.length - 1]
  return first.split(".")[0]
}

const SendWhatsAppMediaFlow = async ({
  media,
  ticket,
  body,
  isFlow = false,
  isRecord = false
}: RequestFlow): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const mimetype = mime.lookup(media)
    const pathMedia = media

    const typeMessage = mimetype.split("/")[0];
    const mediaName= nameFileDiscovery(media)
    
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      console.log('record', isRecord)
      if (isRecord) {
        const convert = await processAudio(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeMessage ? "audio/mp4" : mimetype,
          ptt: true
        };
      } else {
        const convert = await processAudioFile(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: typeMessage ? "audio/mp4" : mimetype,
          ptt: false
        };
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
     } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body
      };
    }

    let contact = await Contact.findOne({
      where: {
        id: ticket.contactId,
      }
    });

    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: mediaName });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMediaFlow;
