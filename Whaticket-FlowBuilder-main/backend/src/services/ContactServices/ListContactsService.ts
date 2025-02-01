import { Sequelize, fn, col, where, Op, Filterable } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ContactTag from "../../models/ContactTag";

import { intersection } from "lodash";
import Tag from "../../models/Tag";
import removeAccents from "remove-accents";
import Whatsapp from "../../models/Whatsapp";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
  tagsIds?: number[];
  isGroup?: string;
  userId?: number;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId,
  tagsIds,
  isGroup,
  userId
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"];

  if (searchParam) {
    // console.log("searchParam", searchParam)
    const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: where(
            fn("LOWER", fn("unaccent", col("Contact.name"))),
            "LIKE",
            `%${sanitizedSearchParam}%`
          )
        },
        { number: { [Op.like]: `%${sanitizedSearchParam}%` } }
      ]
    };
  }

  whereCondition = {
    ...whereCondition,
    companyId
  };

  // const user = await ShowUserService(userId, companyId);

  // console.log(user)
  // if (user.whatsappId) {
  //   whereCondition = {
  //     ...whereCondition,
  //     whatsappId: user.whatsappId
  //   };
  // }

  if (Array.isArray(tagsIds) && tagsIds.length > 0) {

    const contactTagFilter: any[] | null = [];
    // for (let tag of tags) {
    const contactTags = await ContactTag.findAll({
      where: { tagId: { [Op.in]: tagsIds } }
    });
    if (contactTags) {
      contactTagFilter.push(contactTags.map(t => t.contactId));
    }
    // }

    const contactTagsIntersection: number[] = intersection(...contactTagFilter);

    whereCondition = {
      ...whereCondition,
      id: {
        [Op.in]: contactTagsIntersection
      }
    };
  }

  if (isGroup === "false") {
    console.log("isGroup", isGroup)
    whereCondition = {
      ...whereCondition,
      isGroup: false
    }
  }


  const limit = 100;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    attributes: ["id", "name", "number", "email", "isGroup", "urlPicture", "active", "companyId", "channel"],
    limit,
    include: [
      // {
      //   model: Ticket,
      //   as: "tickets",
      //   attributes: ["id", "status", "createdAt", "updatedAt"],
      //   limit: 1,
      //   order: [["updatedAt", "DESC"]]
      // },   
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"]
        //include: ["tags"]
      },
      // {
      //   model: Whatsapp,
      //   as: "whatsapp",
      //   attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
      // },
    ],
    offset,
    // subQuery: false,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
