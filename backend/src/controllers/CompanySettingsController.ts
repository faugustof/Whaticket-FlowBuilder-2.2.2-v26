/** 
 * @TercioSantos-0 |
 * controller/get/todas as configurações de 1 empresa |
 * controller/get/1 configuração específica |
 * controller/put/atualização de 1 configuração |
 * @param:companyId
 */
import { Request, Response } from "express";
import FindCompanySettingsService from "../services/CompaniesSettings/FindCompanySettingsService";
import UpdateCompanySettingsService from "../services/CompaniesSettings/UpdateCompanySettingService";
import FindCompanySettingOneService from "../services/CompaniesSettings/FindCompanySettingOneService";

type IndexGetCompanySettingQuery = {
  companyId: number;
  column: string;
  data:string;
};

type IndexGetCompanySettingOneQuery = {
  column: string;
};

export const show = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { companyId } = req.user;

    const settings = await FindCompanySettingsService({
      companyId
    });

    return res.status(200).json(settings);
  };


  export const showOne = async (req: Request, res: Response): Promise<Response> => {
    const { column } = req.query as IndexGetCompanySettingOneQuery;
    const { companyId } = req.user;
    
    const setting = await FindCompanySettingOneService({
      companyId,
      column
    });
    
    return res.status(200).json(setting[0]);
  };

export const update = async(
  req: Request,
  res: Response
): Promise<Response> => {
  const {  column, data } = req.body as IndexGetCompanySettingQuery;
  const { companyId } = req.user;

  const result = await UpdateCompanySettingsService({
    companyId,
    column,
    data
  })
  
  return res.status(200).json({response:true, result:result});
}
