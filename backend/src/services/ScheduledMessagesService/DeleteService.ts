import ScheduledMessages from "../../models/ScheduledMessages";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  const schedule = await ScheduledMessages.findOne({ where: { id, companyId } });

  if (!schedule) throw new AppError("ERR_NO_SCHEDULE_FOUND", 404);

  await schedule.destroy();
};

export default DeleteService;
