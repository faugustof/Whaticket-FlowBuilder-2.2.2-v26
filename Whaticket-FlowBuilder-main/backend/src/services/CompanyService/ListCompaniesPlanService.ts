import Company from "../../models/Company";
import Plan from "../../models/Plan";

const ListCompaniesPlanService = async (): Promise<Company[]> => {
  const companies = await Company.findAll({
    attributes: ["id", "name", "email", "status", "dueDate", "createdAt", "phone", "document", "lastLogin", "folderSize", "numberFileFolder", "updatedAtFolder"],
    order: [["id", "ASC"]],
    include: [
      {
        model: Plan, as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "amount",
          "useWhatsapp",
          "useFacebook",
          "useInstagram",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi",
          "useKanban",
          "useOpenAi",
          "useIntegrations"
        ]
      },
    ]
  });
  return companies;
};

export default ListCompaniesPlanService;
