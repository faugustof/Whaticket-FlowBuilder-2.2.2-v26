import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";

interface Request {
  companyId: number;
}

interface Response {
  flow: FlowCampaignModel[]
}

const FlowsCampaignGetDataService = async ({
  companyId,
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowCampaignModel.findAndCountAll({
          where: {
            companyId: companyId,
          }
        });
        
        const flowResult = []
        rows.forEach((flow) => {
          flowResult.push(flow.toJSON());
        });

        return {
            flow: flowResult
        }
      } catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
      }
};

export default FlowsCampaignGetDataService;
