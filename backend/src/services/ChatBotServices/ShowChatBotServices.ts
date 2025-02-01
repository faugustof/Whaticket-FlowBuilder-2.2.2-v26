import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";
import User from "../../models/User";

const ShowChatBotServices = async (id: number | string): Promise<Chatbot> => {
  const queue = await Chatbot.findOne({
    where: {
      id
    },
    order: [
      [{ model: Chatbot, as: "mainChatbot" }, "id", "ASC"],
      [{ model: Chatbot, as: "options" }, "id", "ASC"],
      ["id", "asc"]
    ],
    include: [
      {
        model: Chatbot,
        as: "mainChatbot",
        include: [
          {
            model: User,
            as: "user"
          },
        ]
      },
      {
        model: Chatbot,
        as: "options",
        include: [
          {
            model: User,
            as: "user"
          },
        ]
      },
      {
        model: User,
        as: "user"
      },
    ]
  });

  if (!queue) {
    throw new AppError("Chatbot not found", 404);
  }

  return queue;
};

export default ShowChatBotServices;
