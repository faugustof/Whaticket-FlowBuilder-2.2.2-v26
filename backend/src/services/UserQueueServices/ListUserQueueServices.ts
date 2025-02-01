import { Op, Sequelize } from "sequelize";
import AppError from "../../errors/AppError";
import UserQueue from "../../models/UserQueue"

const ListUserQueueServices = async (queueId: string | number): Promise<UserQueue> => {
    const userQueue = await UserQueue.findOne({
        where: {
            queueId: {
                [Op.or]: [queueId]
            }
        },
        order: Sequelize.literal('random()')
    });

    if (!userQueue) {
        throw new AppError("ERR_NOT_FOUND_USER_IN_QUEUE", 404);
    }

    return userQueue;
};

export default ListUserQueueServices;
