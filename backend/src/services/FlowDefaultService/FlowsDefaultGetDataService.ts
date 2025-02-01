import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { FlowDefaultModel } from "../../models/FlowDefault";

interface Request {
  companyId: number;
}

interface Response {
  flow: FlowDefaultModel
}

const FlowsDefaultGetDataService = async ({
  companyId,
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowDefaultModel.findAndCountAll({
          where: {
            companyId: companyId,
          }
        });
        
        const flowResult = []
        rows.forEach((flow) => {
          flowResult.push(flow.toJSON());
        });

        return {
            flow: flowResult[0]
        }
      } catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
      }
};

export default FlowsDefaultGetDataService;