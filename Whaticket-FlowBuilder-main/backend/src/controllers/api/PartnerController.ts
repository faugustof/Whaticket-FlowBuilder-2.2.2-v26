import * as Yup from "yup";
import { Request, Response } from "express";

import ListService from "../../services/PartnerServices/ListService";
import CreateService from "../../services/PartnerServices/CreateService";
import ShowService from "../../services/PartnerServices/ShowService";
import UpdateService from "../../services/PartnerServices/UpdateService";
import DeleteService from "../../services/PartnerServices/DeleteService";

import AppError from "../../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StoreData = {
  name: string;
  phone: string;
  email: string;
  document: string;
  commission: number;
  typeCommission: string;
  walletId?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { records, count, hasMore } = await ListService({
    searchParam,
    pageNumber
  });
  return res.json({ records, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    email: Yup.string().required(),
    document: Yup.string().required(),
    commission: Yup.number().required(),
    typeCommission: Yup.string().required(),
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const record = await CreateService({
    ...data
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowService(id);

  return res.status(200).json(record);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as StoreData;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    email: Yup.string().required(),
    document: Yup.string().required(),
    commission: Yup.number().required(),
    typeCommission: Yup.string().required(),
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const record = await UpdateService({
    ...data,
    id
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const Partner = await DeleteService(id);

  return res.status(200).json(Partner);
};
