import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";

interface Request {
  companyId: number;
  idFlow:number
}

interface Response {
  details: FlowCampaignModel
}

const GetFlowsCampaignDataService = async ({
  companyId,
  idFlow
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowCampaignModel.findAndCountAll({
          where: {
            id: idFlow
          }
        });
        
        let hook = rows[0]

        return {
            details: hook
        }
      } catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
      }
};

export default GetFlowsCampaignDataService;
