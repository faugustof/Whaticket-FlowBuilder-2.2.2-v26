import Partner from "../../models/Partner";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string): Promise<void> => {
  const record = await Partner.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_PARTNER_FOUND", 404);
  }

  await record.destroy();
};

export default DeleteService;
