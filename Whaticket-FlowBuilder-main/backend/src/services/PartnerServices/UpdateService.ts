import AppError from "../../errors/AppError";
import Partner from "../../models/Partner";

interface Data {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  document: string;
  commission: number;
  typeCommission: string;
  walletId?: string;
}

const UpdateService = async (data: Data): Promise<Partner> => {
  const { id } = data;

  const record = await Partner.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_PARTNER_FOUND", 404);
  }

  await record.update(data);

  return record;
};

export default UpdateService;
