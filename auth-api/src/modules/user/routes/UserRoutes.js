import { Router } from "express";

import UserController from "../controller/userController.js";
import checkToken from "../../../config/auth/checkToken.js";

const routes = new Router();

routes.post('/api/user/auth', UserController.getAccessToken);

routes.use(checkToken);
routes.get('/api/user/email/:email', UserController.findByEmail);


export default routes;