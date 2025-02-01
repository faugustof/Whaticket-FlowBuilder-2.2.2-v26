import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const ShowEmailCompanyService = async (email: string ): Promise<Company> => {
  const company = await Company.findOne({
    where: { email },
    include: ["plan"]
  });

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  return company;
};

export default ShowEmailCompanyService;
