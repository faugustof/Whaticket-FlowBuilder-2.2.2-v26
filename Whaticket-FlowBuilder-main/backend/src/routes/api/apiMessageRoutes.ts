import express from "express";

import * as MessageController from "../../controllers/api/MessageController";
import isAuthCompany from "../../middleware/isAuthCompany";

const apiMessageRoutes = express.Router();

apiMessageRoutes.get("/messagesRange", isAuthCompany, MessageController.show);

export default apiMessageRoutes;