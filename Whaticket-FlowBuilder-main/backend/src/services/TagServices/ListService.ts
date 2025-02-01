import { Op, literal, fn, col, Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import ContactTag from "../../models/ContactTag";
import TicketTag from "../../models/TicketTag";

import removeAccents from "remove-accents";
import Contact from "../../models/Contact";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
  kanban?: number;
  tagId?: number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
  kanban = 0,
  tagId = 0
}: Request): Promise<Response> => {
  let whereCondition = {};

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());

  if (Number(kanban) === 0) {
    if (searchParam) {
      whereCondition = {
        [Op.or]: [
          {
            name: Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("Tag.name")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          { color: { [Op.like]: `%${sanitizedSearchParam}%` } }
          // { kanban: { [Op.like]: `%${searchParam}%` } }
        ]
      };
    }

    const { count, rows: tags } = await Tag.findAndCountAll({
      where: { ...whereCondition, companyId, kanban },
      limit,
      include: [
        {
          // model: ContactTag,
          // as: "contactTags",
          // include: [
          //   {
          model: Contact,
          as: "contacts",
          //   }
          // ]
        },
      ],
      attributes: [
        'id',
        'name',
        'color',
      ],
      offset,
      order: [["name", "ASC"]],
    });


    const hasMore = count > offset + tags.length;

    return {
      tags,
      count,
      hasMore
    };

  } else {
    if (searchParam) {
      whereCondition = {
        [Op.or]: [
          {
            name: Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("Tag.name")),
              "LIKE",
              `%${sanitizedSearchParam}%`
            )
          },
          { color: { [Op.like]: `%${sanitizedSearchParam}%` } }
          // { kanban: { [Op.like]: `%${searchParam}%` } }
        ]
      };
    }

    if (tagId > 0) {
      whereCondition = {
        ...whereCondition,
        id: { [Op.ne]: [tagId] }
      }
    }

    // console.log(whereCondition)
    const { count, rows: tags } = await Tag.findAndCountAll({
      where: { ...whereCondition, companyId, kanban },
      limit,
      offset,
      order: [["name", "ASC"]],
      include: [
        {
          model: TicketTag,
          as: "ticketTags",

        },
      ],
      attributes: [
        'id',
        'name',
        'color',
      ],
    });

    const hasMore = count > offset + tags.length;

    return {
      tags,
      count,
      hasMore
    };
  }
};

export default ListService;
