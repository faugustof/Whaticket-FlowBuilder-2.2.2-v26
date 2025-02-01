import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";

interface Request {
  companyId: number;
  idFlow: number
}

interface Response {
  flow: FlowBuilderModel
}

const FlowsGetDataService = async ({
  companyId,
  idFlow
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowBuilderModel.findAndCountAll({
          where: {
            company_id: companyId,
            id: idFlow
          }
        });
        let flow = rows[0]

        return {
            flow: flow
        }
      } catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
      }
};

export default FlowsGetDataService;
