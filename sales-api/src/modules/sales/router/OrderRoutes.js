import { Router } from "express";
import OrderController from "../controller/OrderController.js";

const routes = new Router();

routes.post('/api/order/create', OrderController.createOrder);

export default routes;