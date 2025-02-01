import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { head } from "lodash";

import AppError from "../errors/AppError";

import CreateService from "../services/ScheduledMessagesService/CreateService";
import ListService from "../services/ScheduledMessagesService/ListService";
import UpdateService from "../services/ScheduledMessagesService/UpdateService";
import ShowService from "../services/ScheduledMessagesService/ShowService";
import DeleteService from "../services/ScheduledMessagesService/DeleteService";

type IndexQuery = {
    searchParam?: string;
    pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { pageNumber, searchParam } = req.query as IndexQuery;
    const { companyId } = req.user;

    const { schedules, count, hasMore } = await ListService({ searchParam, pageNumber, companyId });

    return res.json({ schedules, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const {
        data_mensagem_programada,
        id_conexao,
        intervalo,
        valor_intervalo,
        mensagem,
        tipo_dias_envio,
        mostrar_usuario_mensagem,
        criar_ticket,
        contatos,
        tags,
        nome,
        tipo_arquivo,
        usuario_envio,
        enviar_quantas_vezes
    } = req.body;
    const { companyId } = req.user;
    const files = req.files as Express.Multer.File[];
    const file = head(files);

    const schedule = await CreateService({
        data_mensagem_programada,
        id_conexao,
        intervalo,
        valor_intervalo,
        mensagem,
        tipo_dias_envio,
        mostrar_usuario_mensagem,
        criar_ticket,
        contatos: String(contatos).split(','),
        tags: String(tags).split(','),
        nome,
        tipo_arquivo,
        usuario_envio,
        enviar_quantas_vezes,
        companyId,
        mediaPath: file?.filename,
        mediaName: file?.originalname
    });

    return res.status(200).json(schedule);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
    const { scheduleId } = req.params;
    const { companyId } = req.user;

    const schedule = await ShowService(scheduleId);

    return res.status(200).json(schedule);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    if (req.user.profile !== "admin") {
        throw new AppError("ERR_NO_PERMISSION", 403);
    }

    const { scheduleId } = req.params;
    const scheduleData = req.body;
    const files = req.files as Express.Multer.File[];
    const file = head(files);

    const schedule = await UpdateService({ scheduleData, id: scheduleId, mediaPath: !!file ? file?.filename : null, mediaName: !!file ? file?.originalname : null });

    return res.status(200).json(schedule);
};

export const remove = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { scheduleId } = req.params;
    const { companyId } = req.user;

    await DeleteService(+scheduleId, +companyId);

    return res.status(200).json({ message: "Schedule deleted" });
};
