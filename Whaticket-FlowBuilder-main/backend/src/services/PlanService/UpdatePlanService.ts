import AppError from "../../errors/AppError";
import Plan from "../../models/Plan";
import ShowPlanService from "./ShowPlanService";

interface PlanData {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  amount?: string;
  useWhatsapp?: boolean;
  useFacebook?: boolean;
  useInstagram?: boolean;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  isPublic?: boolean;
}

const UpdatePlanService = async (planData: PlanData): Promise<Plan> => {
  const { id } = planData;

  let plan = await Plan.findByPk(id);

  if (!plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  await plan.update(planData);

  return plan;
};

export default UpdatePlanService;
