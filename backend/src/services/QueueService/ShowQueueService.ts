import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";
import Queue from "../../models/Queue";
import User from "../../models/User";

const ShowQueueService = async (
  queueId: number | string,
  companyId: number
): Promise<Queue> => {
  const queue = await Queue.findOne({
    where: {
      id: queueId,
      companyId
    },
    include: [{
      model: Chatbot,
      as: "chatbots",
      include: [
        {
          model: User,
          as: "user"
        },
      ]
    }
  ],
    order: [
      [{ model: Chatbot, as: "chatbots" }, "id", "asc"],
      ["id", "ASC"]
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
