import { Op, Filterable } from "sequelize";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UserQueue";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";

interface Request {
  dateStart: string;
  dateEnd: string;
  status?: string[];
  userId: string;
  queuesIds?: string[];
  companyId: string | number;
  showAll?: string | boolean;
}

const TicketsQueuesService = async ({
  dateStart,
  dateEnd,
  status,
  userId,
  queuesIds,
  companyId,
  showAll
}: Request): Promise<Ticket[]> => {
  let whereCondition: Filterable["where"] = {
    // [Op.or]: [{ userId }, { status: "pending" }]
  };

  const includeCondition = [
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "profile", "online", "profileImage"],
    },
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      association: "whatsapp",
      attributes: ["id", "name"]
    }
  ];
  const isExistsQueues = await Queue.count({ where: { companyId } });
  // eslint-disable-next-line eqeqeq
  if (isExistsQueues) {
    const queues = await UsersQueues.findAll({
      where: {
        userId
      }
    });
    let queuesIdsUser = queues.map(q => q.queueId);

    if (queuesIds) {
      const newArray: number[] = [];
      queuesIds.forEach(i => {
        const idx = queuesIdsUser.indexOf(+i);
        if (idx) {
          newArray.push(+i);
        }
      });
      queuesIdsUser = newArray;
    }

    whereCondition = {
      ...whereCondition,
      queueId: {
        [Op.in]: queuesIdsUser
      }
    };
  }

  // eslint-disable-next-line eqeqeq
  if (showAll == "true") {
    whereCondition = {};
  }

  whereCondition = {
    ...whereCondition,
    status: { [Op.in]: ["open", "pending"] },
    companyId
  }

  if (dateStart && dateEnd) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [
          +startOfDay(parseISO(dateStart)),
          +endOfDay(parseISO(dateEnd))
        ]
      }
    };
  }

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    distinct: true,
    subQuery: false,
    order: [
      ["user", "name", "ASC"],
      ["updatedAt", "DESC"],
    ]
  });
  return tickets;
};

export default TicketsQueuesService;
