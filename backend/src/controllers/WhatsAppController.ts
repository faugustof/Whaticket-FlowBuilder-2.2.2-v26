import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import cacheLayer from "../libs/cache";
import { removeWbot, restartWbot } from "../libs/wbot";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import { getAccessTokenFromPage, getPageProfile, subscribeApp } from "../services/FacebookServices/graphAPI";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { closeTicketsImported } from "../services/WhatsappService/ImportWhatsAppMessageService";
import ShowWhatsAppServiceAdmin from "../services/WhatsappService/ShowWhatsAppServiceAdmin";
import UpdateWhatsAppServiceAdmin from "../services/WhatsappService/UpdateWhatsAppServiceAdmin";
import ListAllWhatsAppsService from "../services/WhatsappService/ListAllWhatsAppService";
import ListFilterWhatsAppsService from "../services/WhatsappService/ListFilterWhatsAppsService";
import User from "../models/User";

interface WhatsappData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
  maxUseBotQueues?: string;
  timeUseBotQueues?: string;
  expiresTicket?: number;
  allowGroup?: false;
  sendIdQueue?: number;
  timeSendQueue?: number;
  timeInactiveMessage?: string;
  inactiveMessage?: string;
  ratingMessage?: string;
  maxUseBotQueuesNPS?: number;
  expiresTicketNPS?: number;
  whenExpiresTicket?: string;
  expiresInactiveMessage?: string;
  importOldMessages?: string;
  importRecentMessages?: string;
  importOldMessagesGroups?: boolean;
  closedTicketsPostImported?: boolean;
  groupAsTicket?: string;
  timeCreateNewTicket?: number;
  schedules?: any[];
  promptId?: number;
  collectiveVacationMessage?: string;
  collectiveVacationStart?: string;
  collectiveVacationEnd?: string;
  queueIdImportMessages?: number;
  flowIdNotPhrase?: number;
  flowIdWelcome?: number;
}

interface QueryParams {
  session?: number | string;
  channel?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session });

  return res.status(200).json(whatsapps);
};

export const indexFilter = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session, channel } = req.query as QueryParams;

  const whatsapps = await ListFilterWhatsAppsService({ companyId, session, channel });

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    token,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome
  }: WhatsappData = req.body;
  const { companyId } = req.user;

  const company = await ShowCompanyService(companyId)
  const plan = await ShowPlanService(company.planId);

  if (!plan.useWhatsapp) {
    return res.status(400).json({
      error: "Você não possui permissão para acessar este recurso!"
    });
  }

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    companyId,
    token,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    flowIdNotPhrase,
    flowIdWelcome
  });

  StartWhatsAppSession(whatsapp, companyId);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);

};

export const storeFacebook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      facebookUserId,
      facebookUserToken,
      addInstagram
    }: {
      facebookUserId: string;
      facebookUserToken: string;
      addInstagram: boolean;
    } = req.body;
    const { companyId } = req.user;

    // const company = await ShowCompanyService(companyId)
    // const plan = await ShowPlanService(company.planId);

    // if (!plan.useFacebook) {
    //   return res.status(400).json({
    //     error: "Você não possui permissão para acessar este recurso!"
    //   });
    // }

    const { data } = await getPageProfile(facebookUserId, facebookUserToken);

    if (data.length === 0) {
      return res.status(400).json({
        error: "Facebook page not found"
      });
    }
    const io = getIO();

    const pages = [];
    for await (const page of data) {
      const { name, access_token, id, instagram_business_account } = page;

      const acessTokenPage = await getAccessTokenFromPage(access_token);

      if (instagram_business_account && addInstagram) {
        const { id: instagramId, username, name: instagramName } = instagram_business_account;

        pages.push({
          companyId,
          name: `Insta ${username || instagramName}`,
          facebookUserId: facebookUserId,
          facebookPageUserId: instagramId,
          facebookUserToken: acessTokenPage,
          tokenMeta: facebookUserToken,
          isDefault: false,
          channel: "instagram",
          status: "CONNECTED",
          greetingMessage: "",
          farewellMessage: "",
          queueIds: [],
          isMultidevice: false
        });

        pages.push({
          companyId,
          name,
          facebookUserId: facebookUserId,
          facebookPageUserId: id,
          facebookUserToken: acessTokenPage,
          tokenMeta: facebookUserToken,
          isDefault: false,
          channel: "facebook",
          status: "CONNECTED",
          greetingMessage: "",
          farewellMessage: "",
          queueIds: [],
          isMultidevice: false
        });

        await subscribeApp(id, acessTokenPage);
      }

      if (!instagram_business_account) {
        pages.push({
          companyId,
          name,
          facebookUserId: facebookUserId,
          facebookPageUserId: id,
          facebookUserToken: acessTokenPage,
          tokenMeta: facebookUserToken,
          isDefault: false,
          channel: "facebook",
          status: "CONNECTED",
          greetingMessage: "",
          farewellMessage: "",
          queueIds: [],
          isMultidevice: false
        });

        await subscribeApp(page.id, acessTokenPage);
      }

    }

    for await (const pageConection of pages) {

      const exist = await Whatsapp.findOne({
        where: {
          facebookPageUserId: pageConection.facebookPageUserId
        }
      });

      if (exist) {
        await exist.update({
          ...pageConection
        });
      }

      if (!exist) {
        const { whatsapp } = await CreateWhatsAppService(pageConection);

        io.of(String(companyId))
          .emit(`company-${companyId}-whatsapp`, {
            action: "update",
            whatsapp
          });

      }
    }
    return res.status(200);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Facebook page not found"
    });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { session } = req.query;

  // console.log("SHOWING WHATSAPP", whatsappId)
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session);


  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);

};

export const closedTickets = async (req: Request, res: Response) => {
  const { whatsappId } = req.params

  closeTicketsImported(whatsappId)

  return res.status(200).json("whatsapp");

}

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId, profile } = req.user;
  const io = getIO();

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  console.log("REMOVING WHATSAPP", whatsappId)
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);


  if (whatsapp.channel === "whatsapp") {
    await DeleteBaileysService(whatsappId);
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
    removeWbot(+whatsappId);

    io.of(String(companyId))
      .emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: +whatsappId
      });

  }

  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({
      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    for await (const whatsapp of getAllSameToken) {
      io.of(String(companyId))
        .emit(`company-${companyId}-whatsapp`, {
          action: "delete",
          whatsappId: whatsapp.id
        });
    }

  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id } = req.user;

  const user = await User.findByPk(id);
  const { allowConnections } = user;

  if (profile !== "admin" && allowConnections === "disabled") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await restartWbot(companyId);

  return res.status(200).json({ message: "Whatsapp restart." });
};

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListAllWhatsAppsService({ session });
  return res.status(200).json(whatsapps);
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppServiceAdmin({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId))
    .emit(`admin-whatsapp`, {
      action: "update",
      whatsapp
    });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId))
      .emit(`admin-whatsapp`, {
        action: "update",
        whatsapp: oldDefaultWhatsapp
      });
  }

  return res.status(200).json(whatsapp);
};

export const removeAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const io = getIO();
  console.log("REMOVING WHATSAPP ADMIN", whatsappId)
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);


  if (whatsapp.channel === "whatsapp") {
    await DeleteBaileysService(whatsappId);
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
    removeWbot(+whatsappId);

    io.of(String(companyId))
      .emit(`admin-whatsapp`, {
        action: "delete",
        whatsappId: +whatsappId
      });

  }

  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({

      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    for await (const whatsapp of getAllSameToken) {
      io.of(String(companyId))
        .emit(`company-${companyId}-whatsapp`, {
          action: "delete",
          whatsappId: whatsapp.id
        });
    }

  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const showAdmin = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  // console.log("SHOWING WHATSAPP ADMIN", whatsappId)
  const whatsapp = await ShowWhatsAppServiceAdmin(whatsappId);


  return res.status(200).json(whatsapp);
};

