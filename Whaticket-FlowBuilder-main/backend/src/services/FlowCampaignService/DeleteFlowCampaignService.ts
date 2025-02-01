import AppError from "../../errors/AppError";
import { FlowCampaignModel } from "../../models/FlowCampaign";

const DeleteFlowCampaignService = async (id: number): Promise<FlowCampaignModel> => {
  
  const flow = await FlowCampaignModel.findOne({
    where: { id: id }
  });

  if (!flow) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await flow.destroy();

  return flow;
};

export default DeleteFlowCampaignService;

