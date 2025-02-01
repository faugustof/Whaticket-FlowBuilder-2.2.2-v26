/** 
 * @TercioSantos-0 |
 * serviço/todas as configurações de 1 empresa |
 * @param:companyId
 */
import CompaniesSettings from "../../models/CompaniesSettings";

interface Request {
  companyId: number;
};

const FindCompanySettingsService = async ({
  companyId
}:Request): Promise<CompaniesSettings> => {
  const companySettings = await CompaniesSettings.findOne({
    where: {companyId}
  });
  return companySettings;
};

export default FindCompanySettingsService;