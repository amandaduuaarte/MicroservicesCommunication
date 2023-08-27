import { Router } from "express";
import OrderController from "../controller/OrderController.js";

const routes = new Router();

routes.get("/api/order/:id", OrderController.findById);
routes.get("/api/orders/product/:productId", OrderController.findByProductId);
routes.get("/api/orders", OrderController.findAll);
routes.post('/api/order/create', OrderController.createOrder);

export default routes;