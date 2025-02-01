import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();
const upload = multer(uploadConfig);

contactRoutes.post("/contacts/import", isAuth, ImportPhoneContactsController.store);

contactRoutes.post("/contactsImport", isAuth, ContactController.importXls);
contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/list", isAuth, ContactController.list);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);
contactRoutes.put("/contacts/toggleAcceptAudio/:contactId", isAuth, ContactController.toggleAcceptAudio);
contactRoutes.get("/contacts", isAuth, ContactController.getContactVcard);
contactRoutes.get("/contacts/profile/:number", isAuth, ContactController.getContactProfileURL);

contactRoutes.put("/contacts/block/:contactId", isAuth, ContactController.blockUnblock);
contactRoutes.post("/contacts/upload", isAuth, upload.array("file"), ContactController.upload);
contactRoutes.get("/contactTags/:contactId", isAuth, ContactController.getContactTags);
contactRoutes.put("/contacts/toggleDisableBot/:contactId", isAuth, ContactController.toggleDisableBot);
contactRoutes.put("/contact-wallet/:contactId", isAuth, ContactController.updateContactWallet);
// contactRoutes.get("/contacts/list-whatsapp", isAuth, ContactController.listWhatsapp);

export default contactRoutes;
