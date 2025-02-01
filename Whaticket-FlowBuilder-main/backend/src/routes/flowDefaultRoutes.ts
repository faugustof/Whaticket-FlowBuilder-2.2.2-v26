import express from "express";
import isAuth from "../middleware/isAuth";

import * as FlowDefaultController from "../controllers/FlowDefaultController";

const flowDefaultRoutes = express.Router();

flowDefaultRoutes.post(
  "/flowdefault",
  isAuth,
  FlowDefaultController.createFlowDefault
);

flowDefaultRoutes.put("/flowdefault", isAuth, FlowDefaultController.updateFlow);

flowDefaultRoutes.get("/flowdefault", isAuth, FlowDefaultController.getFlows);

export default flowDefaultRoutes;