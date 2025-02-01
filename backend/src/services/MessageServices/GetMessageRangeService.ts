import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";

interface Request {
    companyId: number;
    startDate: string;
    lastDate: string;
}

const dbConfig = require("../../config/database");
const sequelize = new Sequelize(dbConfig);

const GetMessageRangeService = async ({ companyId, startDate, lastDate }: Request): Promise<Message[]> => {
    let messages: any
    messages = await sequelize.query(
        `select * from "Messages" m where "companyId" = ${companyId} and "createdAt" between '${startDate} 00:00:00' and '${lastDate} 23:59:59'`,
        {
            type: QueryTypes.SELECT
        }
    );

    if (!messages) {
        throw new AppError("MESSAGES_NOT_FIND");
    }

    return messages;
};

export default GetMessageRangeService;