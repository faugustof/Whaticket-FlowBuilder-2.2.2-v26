import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";

interface TagData {
  id?: number;
  name?: string;
  color?: string;
  kanban?: number;
  timeLane?: number;
  nextLaneId?: number;
  greetingMessageLane: string;
  rollbackLaneId?: number;
}

interface Request {
  tagData: TagData;
  id: string | number;
}

const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag | undefined> => {
  const tag = await ShowService(id);

  const schema = Yup.object().shape({
    name: Yup.string().min(3)
  });

  const { name, color, kanban,
    timeLane,
    nextLaneId = null,
    greetingMessageLane,
    rollbackLaneId = null} = tagData;

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await tag.update({
    name,
    color,
    kanban,
    timeLane,
    nextLaneId: String(nextLaneId) === "" ? null : nextLaneId,
    greetingMessageLane,
    rollbackLaneId: String(rollbackLaneId) === "" ? null : rollbackLaneId,
  });

  await tag.reload();
  return tag;
};

export default UpdateUserService;
