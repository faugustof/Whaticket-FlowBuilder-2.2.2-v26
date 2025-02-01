import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import ListService from "../services/CampaignSettingServices/ListService";
import CreateService from "../services/CampaignSettingServices/CreateService";
import UpdateServiceCampaignSettings from "../services/CampaignSettingServices/UpdateServiceCampaignSettings";

interface StoreData {
  settings: any;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const records = await ListService({
    companyId
  });

  return res.json(records);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as StoreData;

  const record = await CreateService(data, companyId);

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-campaignSettings`, {
      action: "create",
      record
    });

  return res.status(200).json(record);
};

/*
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const record = await UpdateServiceCampaignSettings({
    ...data,
    id
  });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-campaign`, {
    action: "update",
    record
  });

  return res.status(200).json(record);
};
*/
