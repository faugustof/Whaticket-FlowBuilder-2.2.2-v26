import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";

const FindCompaniesWhatsappService = async (id: string | number): Promise<Company> => {
  const companies = await Company.findOne({
    where: { id },
    order: [["name", "ASC"]],
    include: [
      { model: Whatsapp, attributes: ["id", "name", "status"], where: { isDefault: true } },
    ]
  });
  return companies;
};

export default FindCompaniesWhatsappService;
