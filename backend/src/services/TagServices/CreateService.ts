import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  kanban: string;
  companyId: number;
  timeLane?: number;
  nextLaneId?: number;
  greetingMessageLane?: string;
  rollbackLaneId?: number;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  kanban,
  companyId,
  timeLane = null,
  nextLaneId = null,
  greetingMessageLane = "",
  rollbackLaneId = null
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, kanban, companyId },
    defaults: {
      name, color, kanban, companyId,
      timeLane,
      nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
      greetingMessageLane,
      rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
    }
  });

  await tag.reload();

  return tag;
};

export default CreateService;
