import { Request, Response } from "express";

import FindAllContactService from "../../services/ContactServices/FindAllContactsServices";

type IndexQuery = {
    companyId: number;
};

export const show = async (req: Request, res:Response): Promise<Response> => {
   const { companyId } = req.body as IndexQuery;
   
   const contacts = await FindAllContactService({companyId});

   return res.json({count:contacts.length, contacts});
}

export const count = async (req: Request, res:Response): Promise<Response> => {
    const { companyId } = req.body as IndexQuery;
    
    const contacts = await FindAllContactService({companyId});
 
    return res.json({count:contacts.length}); 
 }
