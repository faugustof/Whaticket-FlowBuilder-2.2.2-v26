import { Router } from "express";

import * as VerssionController from "../controllers/VersionController";

const versionRouter = Router();

versionRouter.get("/version", VerssionController.index);
versionRouter.post("/version", VerssionController.store);

export default versionRouter;
