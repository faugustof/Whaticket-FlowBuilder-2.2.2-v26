import { Op } from "sequelize";
import QuickMessage from "../../models/QuickMessage";
import Company from "../../models/Company";

type Params = {
  companyId: string;
  userId: string;
};

const FindService = async ({ companyId, userId }: Params): Promise<QuickMessage[]> => {
  const notes: QuickMessage[] = await QuickMessage.findAll({
    where: {
      companyId,
      [Op.or]: [
        {
          visao: true // Se "visao" é verdadeiro, todas as mensagens são visíveis
        },
        {
          userId // Se "visao" é falso, apenas as mensagens do usuário atual são visíveis
        }
      ]
    },
    include: [{ model: Company, as: "company", attributes: ["id", "name"] }],
    order: [["shortcode", "ASC"]]
  });

  return notes;
};

export default FindService;
