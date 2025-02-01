import * as Yup from "yup";
import { Request, Response } from "express";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";

import ListCompaniesService from "../../services/CompanyService/ListCompaniesService";
import CreateCompanyService from "../../services/CompanyService/CreateCompanyService";
import UpdateCompanyService from "../../services/CompanyService/UpdateCompanyService";
import ShowCompanyService from "../../services/CompanyService/ShowCompanyService";
import UpdateSchedulesService from "../../services/CompanyService/UpdateSchedulesService";
import DeleteCompanyService from "../../services/CompanyService/DeleteCompanyService";
import FindAllCompaniesService from "../../services/CompanyService/FindAllCompaniesService";
import ShowEmailCompanyService from "../../services/CompanyService/ShowEmailCompanyService";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type CompanyData = {
  name: string;
  id?: number;
  phone?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  partnerId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
};

type SchedulesData = {
  schedules: [];
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { companies, count, hasMore } = await ListCompaniesService({
    searchParam,
    pageNumber
  });

  return res.json({ companies, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newCompany: CompanyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await Company.findOne({
              where: { name: value }
            });

            return !companyWithSameName;
          }
          return false;
        }
      ),
    document: Yup.string()
      .min(11, "ERR_COMPANY_INVALID_DOCUMENT")
      .max(14, "ERR_COMPANY_INVALID_DOCUMENT")
      .required("ERR_COMPANY_INVALID_DOCUMENT")
      .test(
        "Check-unique-document",
        "ERR_COMPANY_DOCUMENT_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameDocument = await Company.findOne({
              where: { document: value }
            });

            return !companyWithSameDocument;
          }
          return false;
        }
      ),
    phone: Yup.string(),
    email: Yup.string(),
    planId: Yup.number().required(),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate(newCompany);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await CreateCompanyService(newCompany);

  return res.status(200).json(company);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const company = await ShowCompanyService(id);

  return res.status(200).json(company);
};

export const showEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.params;

  const company = await ShowEmailCompanyService(email);

  return res.status(200).json(company);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const companies: Company[] = await FindAllCompaniesService();

  return res.status(200).json(companies);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyData: CompanyData = req.body;

  const { id } = req.params;

  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await Company.findOne({
              where: { name: value, id: { [Op.ne]: companyData.id } }
            });
            return !companyWithSameName;
          }
          return false;
        }
      ),
    phone: Yup.string(),
    email: Yup.string(),
    document: Yup.string()
      .min(11, "ERR_COMPANY_INVALID_DOCUMENT")
      .max(14, "ERR_COMPANY_INVALID_DOCUMENT")
      .required("ERR_COMPANY_INVALID_DOCUMENT")
      .test(
        "Check-unique-document",
        "ERR_COMPANY_DOCUMENT_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameDocument = await Company.findOne({
              where: { document: value, id: { [Op.ne]: companyData.id } }
            });

            return !companyWithSameDocument;
          }
          return false;
        }
      ),
    planId: Yup.number().required()
  });

  try {
    await schema.validate(companyData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await UpdateCompanyService({ id, ...companyData });

  return res.status(200).json(company);
};

export const updateSchedules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { schedules }: SchedulesData = req.body;
  const { id } = req.params;

  const company = await UpdateSchedulesService({
    id,
    schedules
  });

  return res.status(200).json(company);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const company = await DeleteCompanyService(id);

  return res.status(200).json(company);
};
