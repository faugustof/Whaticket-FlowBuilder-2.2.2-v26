import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";

interface Request {
  companyId: number;
}

interface Response {
  webhooks: WebhookModel[];
  count: number;
  hasMore: boolean;
}

const ListWebHookService = async ({
  companyId,
}: Request): Promise<Response> => {
  
    try {
    
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await WebhookModel.findAndCountAll({
          where: {
            company_id: companyId
          }
        });
    
        const hooks = []
        rows.forEach((usuario) => {
            hooks.push(usuario.toJSON());
        });

        return {
            webhooks: hooks,
            hasMore: true,
            count: count
        }
      } catch (error) {
        console.error('Erro ao consultar usuários:', error);
      }
};

export default ListWebHookService;
