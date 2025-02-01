import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";

import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";

import removeAccents from "remove-accents";

import FindCompanySettingOneService from "../CompaniesSettings/FindCompanySettingOneService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId: number;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  contacts?: string[];
  updatedStart?: string;
  updatedEnd?: string;
  connections?: string[];
  whatsappIds?: number[];
  statusFilters?: string[];
  queuesFilter?: string[];
  isGroup?: string;
  companyId: number;
  allTicket?: string;
  sortTickets?: string;
  searchOnMessages?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  dateStart,
  dateEnd,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages = "false",
  whatsappIds,
  statusFilters,
  companyId,
  sortTickets = "DESC",
  searchOnMessages = "false"
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId, companyId);

  const showTicketAllQueues = user.allHistoric === "enabled";
  const showTicketWithoutQueue = user.allTicket === "enable";
  const showGroups = user.allowGroup === true;
  const showPendingNotification = await FindCompanySettingOneService({ companyId, column: "showNotificationPending" });
  const showNotificationPendingValue = showPendingNotification[0].showNotificationPending;
    let whereCondition: Filterable["where"];

  whereCondition = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : { [Op.or]: [queueIds] },
    companyId
  };


  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
      include: ["extraInfo", "tags"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
    },
  ];

  const userQueueIds = user.queues.map(queue => queue.id);

  if (status === "open") {
    whereCondition = {
      ...whereCondition,
      userId,
      queueId: { [Op.in]: queueIds }
    };
  } else
    if (status === "group" && user.allowGroup && user.whatsappId) {
      whereCondition = {
        companyId,
        queueId: { [Op.or]: [queueIds, null] },
        whatsappId: user.whatsappId
      };
    }
    else
      if (status === "group" && (user.allowGroup) && !user.whatsappId) {
        whereCondition = {
          companyId,
          queueId: { [Op.or]: [queueIds, null] },
        };
      }
      else
        if (user.profile === "user" && status === "pending" && showTicketWithoutQueue) {
          const TicketsUserFilter: any[] | null = [];

          let ticketsIds = [];

          if (!showTicketAllQueues) {
            ticketsIds = await Ticket.findAll({
              where: {
                userId: { [Op.or]: [user.id, null] },
                queueId: { [Op.or]: [queueIds, null] },
                status: "pending",
                companyId
              },
            });
          } else {
            ticketsIds = await Ticket.findAll({
              where: {
                userId: { [Op.or]: [user.id, null] },
                // queueId: { [Op.or]: [queueIds, null] },
                status: "pending",
                companyId
              },
            });
          }

          if (ticketsIds) {
            TicketsUserFilter.push(ticketsIds.map(t => t.id));
          }
          // }

          const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

          whereCondition = {
            ...whereCondition,
            id: ticketsIntersection
          };
        }
        else
          if (user.profile === "user" && status === "pending" && !showTicketWithoutQueue) {
            const TicketsUserFilter: any[] | null = [];

            let ticketsIds = [];

            if (!showTicketAllQueues) {
              ticketsIds = await Ticket.findAll({
                where: {
                  companyId,
                  userId:
                    { [Op.or]: [user.id, null] },
                  status: "pending",
                  queueId: { [Op.in]: queueIds }
                },
              });
            } else {
              ticketsIds = await Ticket.findAll({
                where: {
                  companyId,
                  [Op.or]:
                    [{
                      userId:
                        { [Op.or]: [user.id, null] }
                    },
                    {
                      status: "pending"
                    }
                    ],
                  // queueId: { [Op.in] : queueIds},
                  status: "pending"
                },
              });
            }
            if (ticketsIds) {
              TicketsUserFilter.push(ticketsIds.map(t => t.id));
            }
            // }

            const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

            whereCondition = {
              ...whereCondition,
              id: ticketsIntersection
            };
          }

  if (showAll === "true" && (user.profile === "admin" || user.allUserChat === "enabled") && status !== "search") {
    if (user.allHistoric === "enabled" && showTicketWithoutQueue) {
      whereCondition = { companyId };
    } else if (user.allHistoric === "enabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.ne]: null } };
    } else if (user.allHistoric === "disabled" && showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.or]: [queueIds, null] } };
    } else if (user.allHistoric === "disabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: queueIds };
    }
  }


  if (status && status !== "search") {
    whereCondition = {
      ...whereCondition,
      status: showAll === "true" && status === "pending" ? { [Op.or]: [status, "lgpd"] } : status
    };
  }


  if (status === "closed") {
    let latestTickets;

    if (!showTicketAllQueues) {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed",
      }

      if (showAll === "false" && user.profile === "admin") {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        }
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    } else {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed",
      }

      if (showAll === "false" && (user.profile === "admin" || user.allUserChat === "enabled")) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        }
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    }

    const ticketIds = latestTickets.map((t) => t.id);

    whereCondition = {
      id: ticketIds

    };
  }
  else
    if (status === "search") {
      whereCondition = {
        companyId
      }
      let latestTickets;
      if (!showTicketAllQueues && user.profile === "user") {
        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: {
            [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
            queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
            companyId
          },
          group: ['companyId', 'contactId', 'whatsappId'],
        });
      } else {
        let whereCondition2: Filterable["where"] = {
          companyId,
          [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }]
        }

        if (showAll === "false" && user.profile === "admin") {
          whereCondition2 = {
            ...whereCondition2,
            queueId: queueIds,

            // [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
          }

        } else if (showAll === "true" && user.profile === "admin") {
          whereCondition2 = {
            companyId,
            queueId: { [Op.or]: [queueIds, null] },
            // status: ["pending", "closed", "group"]
          }
        }

        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: whereCondition2,
          group: ['companyId', 'contactId', 'whatsappId'],
        });

      }

      const ticketIds = latestTickets.map((t) => t.id);

      whereCondition = {
        ...whereCondition,
        id: ticketIds
      };

      // if (date) {
      //   whereCondition = {
      //     createdAt: {
      //       [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      //     }
      //   };
      // }

      // if (dateStart && dateEnd) {
      //   whereCondition = {
      //     updatedAt: {
      //       [Op.between]: [+startOfDay(parseISO(dateStart)), +endOfDay(parseISO(dateEnd))]
      //     }
      //   };
      // }

      // if (updatedAt) {
      //   whereCondition = {
      //     updatedAt: {
      //       [Op.between]: [
      //         +startOfDay(parseISO(updatedAt)),
      //         +endOfDay(parseISO(updatedAt))
      //       ]
      //     }
      //   };
      // }


      if (searchParam) {
        const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
        if (searchOnMessages === "true") {
          includeCondition = [
            ...includeCondition,
            {
              model: Message,
              as: "messages",
              attributes: ["id", "body"],
              where: {
                body: where(
                  fn("LOWER", fn('unaccent', col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                ),
                // ticketId: 
              },
              required: false,
              duplicating: false
            }
          ];
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
              {
                "$message.body$": where(
                  fn("LOWER", fn("unaccent", col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              }
            ]
          };
        } else {
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
              // {
              //   "$message.body$": where(
              //     fn("LOWER", fn("unaccent", col("body"))),
              //     "LIKE",
              //     `%${sanitizedSearchParam}%`
              //   )
              // }
            ]
          };
        }

      }

      if (Array.isArray(tags) && tags.length > 0) {
        const contactTagFilter: any[] | null = [];
        // for (let tag of tags) {
        const contactTags = await ContactTag.findAll({
          where: { tagId: tags }
        });
        if (contactTags) {
          contactTagFilter.push(contactTags.map(t => t.contactId));
        }
        // }

        const contactsIntersection: number[] = intersection(...contactTagFilter);

        whereCondition = {
          ...whereCondition,
          contactId: contactsIntersection
        };
      }

      if (Array.isArray(users) && users.length > 0) {
        whereCondition = {
          ...whereCondition,
          userId: users
        };
      }


      if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
        whereCondition = {
          ...whereCondition,
          whatsappId: whatsappIds
        };
      }

      if (Array.isArray(statusFilters) && statusFilters.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { [Op.in]: statusFilters }
        };
      }

    } else
      if (withUnreadMessages === "true") {
        // console.log(showNotificationPendingValue)
        whereCondition = {
          [Op.or]: [
            {
              userId,
              status: showNotificationPendingValue ? { [Op.notIn]: ["closed", "lgpd", "nps"] } : { [Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
              queueId: { [Op.in]: userQueueIds },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            },
            {
              status: showNotificationPendingValue ? { [Op.in]: ["pending", "group"] } : { [Op.in]: ["group"] },
              queueId: showTicketWithoutQueue ? { [Op.or]: [userQueueIds, null] } : { [Op.or]: [userQueueIds] },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            }
          ]
        };

        if (status === "group" && (user.allowGroup || showAll === "true")) {
          whereCondition = {
            ...whereCondition,
            queueId: { [Op.or]: [userQueueIds, null] },
          };
        }
      }

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    attributes: ["id", "uuid", "userId", "queueId", "isGroup", "channel", "status", "contactId", "useIntegration", "lastMessage", "updatedAt", "unreadMessages"],
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", sortTickets]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
