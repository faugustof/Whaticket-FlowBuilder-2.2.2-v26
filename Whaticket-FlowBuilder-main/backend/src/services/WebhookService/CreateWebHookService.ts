import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const CreateWebHookService = async ({
  userId,
  name,
  companyId
}: Request): Promise<WebhookModel | string> => {
  try {

    const nameExist = await WebhookModel.findOne({
      where: {
        name,
        company_id: companyId
      }
    })

    if(nameExist){
      return 'exist'
    }

    const generateHash = randomString(42);
    const webhook = await WebhookModel.create({
      user_id: userId,
      hash_id: generateHash,
      company_id: companyId,
      name: name,
      active: true,
      config: null
    });

    return webhook;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default CreateWebHookService;
