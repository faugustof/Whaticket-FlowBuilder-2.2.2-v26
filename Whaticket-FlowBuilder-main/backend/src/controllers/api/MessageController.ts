import { Request, Response } from "express";
import GetMessageRangeService from "../../services/MessageServices/GetMessageRangeService";

type IndexQuery = {
    companyId: number;
    startDate: string;
    lastDate: string;
};
export const show = async (req: Request, res: Response): Promise<Response> => {
    const { companyId, startDate, lastDate } = req.body as IndexQuery;
    const messages = await GetMessageRangeService({ companyId, startDate, lastDate });
    return res.status(200).json(messages);
};