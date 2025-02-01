import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

const APIShowEmailUserService = async (email: string): Promise<User> => {
  const user = await User.findOne(
    {
      where: {
        email
      },
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "dueDate", "document"],
          include: [
            {
              model: Plan, as: "plan",
              attributes: ["id",
                "name",
                "amount",
                "useWhatsapp",
                "useFacebook",
                "useInstagram",
                "useCampaigns",
                "useSchedules",
                "useInternalChat",
                "useExternalApi",
                "useIntegrations",
                "useOpenAi",
                "useKanban"
              ]
            },
          ]
        },
      ]
    });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default APIShowEmailUserService;
