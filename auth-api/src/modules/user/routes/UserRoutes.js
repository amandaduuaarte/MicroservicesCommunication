import { Router } from "express";
import UserController from "../controller/userController.js";

const routes = new Router();

routes.get('/api/user/email/:email', UserController.findByEmail);
routes.post('/api/user/auth', UserController.getAccessToken);


export default routes;