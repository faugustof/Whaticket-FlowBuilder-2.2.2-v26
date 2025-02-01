import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Partner from "../../models/Partner";

interface Data {
  name: string;
  phone: string;
  email: string;
  document: string;
  commission: number;
  typeCommission: string;
  walletId?: string;
}

const CreateService = async (data: Data): Promise<Partner> => {
  const record = await Partner.create(data);

  return record;
};

export default CreateService;
