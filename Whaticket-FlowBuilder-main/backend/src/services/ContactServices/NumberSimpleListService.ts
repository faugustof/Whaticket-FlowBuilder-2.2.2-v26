import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { FindOptions, Op } from "sequelize";

export interface SearchContactParams {
  companyId: string | number;
  number: string;
}

const NumberSimpleListService = async ({ number, companyId }: SearchContactParams): Promise<Contact[]> => {
  let options: FindOptions = {
    order: [
      ['name', 'ASC']
    ]
  }

  if (number) {
    options.where = {
      number: {
        [Op.like]: `%${number}%`
      }
    }
  }

  options.where = {
    ...options.where,
    companyId
  }

  const contacts = await Contact.findAll(options);

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default NumberSimpleListService;
