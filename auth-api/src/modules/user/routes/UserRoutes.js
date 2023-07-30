import { Router } from "express";
import UserController from "../controller/userController.js";

const routes = new Router();

routes.get('/api/user/email/:email', UserController.findByEmail);

export default routes;