import { Request, Response } from "express";
import Version from "../models/Versions";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const version = await Version.findByPk(1);
    return res.status(200).json({
        version: version.versionFrontend
    });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const version = await Version.findByPk(1);
    version.versionFrontend = req.body.version;
    await version.save();

    return res.status(200).json({
        version: version.versionFrontend
    });
};
