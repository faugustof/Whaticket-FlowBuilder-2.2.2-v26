import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const userRoutes = Router();

userRoutes.get("/users", isAuth, UserController.index);

userRoutes.get("/users/list", isAuth, UserController.list);

userRoutes.post("/users", isAuth, UserController.store);

userRoutes.put("/users/:userId", isAuth, UserController.update);

userRoutes.get("/users/:userId", isAuth, UserController.show);

userRoutes.delete("/users/:userId", isAuth, UserController.remove);

userRoutes.post("/users/:userId/media-upload", isAuth, upload.array("profileImage"), UserController.mediaUpload);

userRoutes.put("/users/toggleChangeWidht/:userId", isAuth, UserController.toggleChangeWidht);

export default userRoutes;
