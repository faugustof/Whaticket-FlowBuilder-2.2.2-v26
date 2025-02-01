import { Request, Response } from "express";
import CreateWebHookService from "../services/WebhookService/CreateWebHookService";
import DeleteWebHookService from "../services/WebhookService/DeleteWebHookService";
import UpdateWebHookService from "../services/WebhookService/UpdateWebHookService";
import GetWebHookService from "../services/WebhookService/GetWebHookService";
import DispatchWebHookService from "../services/WebhookService/DispatchWebHookService";
import ListFlowBuilderService from "../services/FlowBuilderService/ListFlowBuilderService";
import CreateFlowBuilderService from "../services/FlowBuilderService/CreateFlowBuilderService";
import UpdateFlowBuilderService from "../services/FlowBuilderService/UpdateFlowBuilderService";
import DeleteFlowBuilderService from "../services/FlowBuilderService/DeleteFlowBuilderService";
import GetFlowBuilderService from "../services/FlowBuilderService/GetFlowBuilderService";
import FlowUpdateDataService from "../services/FlowBuilderService/FlowUpdateDataService";
import FlowsGetDataService from "../services/FlowBuilderService/FlowsGetDataService";
import UploadImgFlowBuilderService from "../services/FlowBuilderService/UploadImgFlowBuilderService";
import UploadAudioFlowBuilderService from "../services/FlowBuilderService/UploadAudioFlowBuilderService";
import DuplicateFlowBuilderService from "../services/FlowBuilderService/DuplicateFlowBuilderService";
import UploadAllFlowBuilderService from "../services/FlowBuilderService/UploadAllFlowBuilderService";
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";

export const createFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name } = req.body;
  const userId = parseInt(req.user.id);
  const { companyId } = req.user;

  const flow = await CreateFlowBuilderService({
    userId,
    name,
    companyId
  });

  if(flow === 'exist'){
    return res.status(402).json('exist')
  }

  return res.status(200).json(flow);
};

export const updateFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { flowId, name } = req.body;

  const flow = await UpdateFlowBuilderService({ companyId, name, flowId });

  if(flow === 'exist'){
    return res.status(402).json('exist')
  }

  return res.status(200).json(flow);
};

export const deleteFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { idFlow } = req.params;

  const flowIdInt = parseInt(idFlow);

  const flow = await DeleteFlowBuilderService(flowIdInt);

  return res.status(200).json(flow);
};

export const myFlows = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const flows = await ListFlowBuilderService({
    companyId
  });

  return res.status(200).json(flows);
};

export const flowOne = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { idFlow } = req.params;

  const { companyId } = req.user;

  const idFlowInt = parseInt(idFlow);

  const webhook = await GetFlowBuilderService({
    companyId,
    idFlow: idFlowInt
  });

  return res.status(200).json(webhook);
};

export const FlowDataUpdate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.user.id);

  const bodyData = req.body;

  const { companyId } = req.user;

  const keys = Object.keys(bodyData);

  console.log(keys);

  const webhook = await FlowUpdateDataService({
    companyId,
    bodyData
  });

  return res.status(200).json(webhook);
};

export const FlowDataGetOne = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { idFlow } = req.params;

  const { companyId } = req.user;

  const idFlowInt = parseInt(idFlow);

  const webhook = await FlowsGetDataService({
    companyId,
    idFlow: idFlowInt
  });

  return res.status(200).json(webhook);
};

export const FlowUploadImg = async (req: Request, res: Response) => {
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;
  const userId = parseInt(req.user.id);

  if (medias.length === 0) {
    return res.status(400).json("No File");
  }

  let nameFile = medias[0].filename;

  if (medias[0].filename.split(".").length === 1) {
    nameFile = medias[0].filename + "." + medias[0].mimetype.split("/")[1];
  }

  const img = await UploadImgFlowBuilderService({
    userId,
    name: nameFile,
    companyId
  });
  return res.status(200).json(img);
};

export const FlowUploadAudio = async (req: Request, res: Response) => {
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;
  const userId = parseInt(req.user.id);

  if (medias.length === 0) {
    return res.status(400).json("No File");
  }

  let nameFile = medias[0].filename;

  if (medias[0].filename.split(".").length === 1) {
    nameFile = medias[0].filename + "." + medias[0].mimetype.split("/")[1];
  }

  const img = await UploadAudioFlowBuilderService({
    userId,
    name: nameFile,
    companyId
  });
  return res.status(200).json(img);
};

export const FlowDuplicate = async (req: Request, res: Response) => {
  const { flowId } = req.body;

  const newFlow = await DuplicateFlowBuilderService({ id: flowId });

  return res.status(200).json(newFlow);
};


export const FlowUploadAll = async (req: Request, res: Response) => {
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;
  const userId = parseInt(req.user.id);

  if (medias.length === 0) {
    return res.status(400).json("No File");
  }

  const items = await UploadAllFlowBuilderService({
    userId,
    medias: medias,
    companyId
  });
  return res.status(200).json(items);
};