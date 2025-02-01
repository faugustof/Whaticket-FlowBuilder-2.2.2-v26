import Partner from "../../models/Partner";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<Partner> => {
  const record = await Partner.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_PARTNER_FOUND", 404);
  }

  return record;
};

export default ShowService;
