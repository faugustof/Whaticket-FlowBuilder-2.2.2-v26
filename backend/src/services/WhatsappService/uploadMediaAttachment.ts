import { Request, Response } from "express";
import { isNil, head } from "lodash";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import path from "path";
import fs from "fs";

export const mediaUpload = async (req: Request, res: Response): Promise<Response> => {
    const { whatsappId } = req.params;
    const files = req.files as Express.Multer.File[];
    const file = head(files);
  
    try {
  
      const whatsapp = await Whatsapp.findByPk(whatsappId);
  
      whatsapp.greetingMediaAttachment = file.filename;
  
      await whatsapp.save();
  
      return res.status(200).json({ mensagem: "Arquivo adicionado!" });
  
    } catch (err: any) {
      throw new AppError(err.message);
    }
  };
  
export const deleteMedia = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { whatsappId } = req.params;
  
    try {
      const whatsapp = await Whatsapp.findByPk(whatsappId);
      const filePath = path.resolve("public", whatsapp.greetingMediaAttachment);
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
        fs.unlinkSync(filePath);
      }
  
      whatsapp.greetingMediaAttachment = null
      await whatsapp.save();
      return res.send({ message: "Arquivo excluído" });
    } catch (err: any) {
      throw new AppError(err.message);
    }
};