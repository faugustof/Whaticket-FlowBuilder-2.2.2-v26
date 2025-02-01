import { Op, Filterable, col, fn } from "sequelize";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import Ticket from "../../models/Ticket";
import UserQueue from "../../models/UserQueue";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";

import { intersection } from "lodash";

interface Request {
  dateStart: string;
  dateEnd: string;
  status?: string[];
  userId: string;
  queuesIds?: string[];
  companyId: string | number;
  showAll?: string | boolean;
  profile?: string;
}

const TicketsQueuesService = async ({
  dateStart,
  dateEnd,
  status,
  userId,
  queuesIds,
  companyId,
  showAll,
  profile
}: Request): Promise<Ticket[]> => {
  let whereCondition: Filterable["where"] = {
    // [Op.or]: [{ userId }, { status: "pending" }]
  };

  const includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name", "profile"]
    },
    {
      model: Queue,
      as: "queue"
    }
  ];

  // const isExistsQueues = await Queue.count({ where: { companyId } });
  // // eslint-disable-next-line eqeqeq
  // if (isExistsQueues) {
  //   const queues = await UserQueue.findAll({
  //     where: {
  //       userId
  //     }
  //   });
  //   let queuesIdsUser = queues.map(q => q.queueId);

  //   if (queuesIds) {
  //     const newArray: number[] = [];
  //     queuesIds.forEach(i => {
  //       const idx = queuesIdsUser.indexOf(+i);
  //       if (idx) {
  //         newArray.push(+i);
  //       }
  //     });
  //     queuesIdsUser = newArray;
  //   }

  //   whereCondition = {
  //     ...whereCondition,
  //     queueId: {
  //       [Op.in]: queuesIdsUser
  //     }
  //   };
  // }

  // eslint-disable-next-line eqeqeq
 
  if (status) {

    const maxTicketsFilter: any[] | null = [];
    const maxTicketIds = await Ticket.findAll({
      where: {       
        status: "open"
      },
      group: ['companyId','contactId','queueId', 'whatsappId'],
      attributes: ['companyId','contactId','queueId', 'whatsappId', [fn('max', col('id')), 'id']],
    });
    if (maxTicketIds) {
      maxTicketsFilter.push(maxTicketIds.map(t => t.id));
    }
    // }

    
    const contactsIntersection: number[] = intersection(...maxTicketsFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: contactsIntersection
      }
    };
  }

  if (profile === "user") {
    whereCondition = {
      ...whereCondition,
      userId
    }
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
  
  const tickets = await Ticket.findAll({
    where: {
      ...whereCondition,
      // queueId: {
      //   [Op.in]: queuesIdsUser
      // },
      companyId
    },
    include: includeCondition,
    order: [["updatedAt", "DESC"]]
  });

  return tickets;
};

export default TicketsQueuesService;
