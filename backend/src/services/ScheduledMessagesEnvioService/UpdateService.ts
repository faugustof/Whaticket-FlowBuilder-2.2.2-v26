import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ScheduledMessages from "../../models/ScheduledMessages";
import ShowService from "./ShowService";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";

interface ScheduleData {
  mediaPath: string;
  mediaName: string;
  mensagem: string;
  companyId: number
  data_envio: Date;
  scheduledmessages: number;
  key: string;
}

interface Request {
  scheduleData: ScheduleData;
  id: string | number;
  companyId: number;
}

const UpdateUserService = async ({
  scheduleData,
  id,
  companyId
}: Request): Promise<ScheduledMessages | undefined> => {
  const schedule = await ShowService(id);

  const schema = Yup.object().shape({
    data_mensagem_programada: Yup.date().required(),
    nome: Yup.string().required(),
    mediaPath: Yup.string(),
    mediaName: Yup.string(),
    mensagem: Yup.string().required(),
    companyId: Yup.number().required(),
    data_envio: Yup.date().required(),
    scheduledmessages: Yup.number().required(),
    key: Yup.string().required(),
  });

  const {
    mediaPath,
    mediaName,
    mensagem,
    data_envio,
    scheduledmessages,
    key
  } = scheduleData;

  try {
    await schema.validate({
      mediaPath,
      mediaName,
      mensagem,
      companyId,
      data_envio,
      scheduledmessages,
      key
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await schedule.update({
    mediaPath,
    mediaName,
    mensagem,
    companyId,
    data_envio,
    scheduledmessages,
    key
  });

  await schedule.reload();
  return schedule;
};

export default UpdateUserService;
