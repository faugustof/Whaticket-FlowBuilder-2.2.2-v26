import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowImgModel } from "../../models/FlowImg";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const UploadImgFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowImgModel> => {
  try {
    const flowImg = await FlowImgModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
    });

    return flowImg;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default UploadImgFlowBuilderService;
