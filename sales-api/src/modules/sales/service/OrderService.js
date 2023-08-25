import OrderRepository from "../repository/OrderRepository.js";
import { sendMessageToProductStockUpdateQueue } from "../../product/rabbitmq/productStockUpdateSender.js";
import { INTERNAL_SERVER_ERROR, SUCCESS, BAD_REQUEST } from "../../../config/constants/httpStatus.js";
import { PENDING } from "../status/orderStatus.js";
import OrderException from "../exception/OrderException.js";
import ProductClient from "../../product/client/ProductClient.js";

class OrderService {
    async createOrder() {
        try {
            let orderData = req.body;
            this.validateOrderData(orderData);
            const { authUser } = req;
            const { authorization } = req.headers;
            let order = this.createInitialOrderData(orderData, authUser);
           await  this.validateProductStock(order, authorization);
            let createdOrder = await OrderRepository.save(order);
            this.sendMessage(order);

            return {
                status: SUCCESS,
                createdOrder
            };
        } catch (error) {
            return {
                status: error.status ? error.status : INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }
    }

    createInitialOrderData(orderData, authUser) {
        return {
                status: PENDING,
                user: authUser,
                createdAt: new Date(),
                updatedAt: new Date(),
                products: orderData
        }
    }
    async  updateOrder(orderMessage) {
        try {
            const order = JSON.parse(orderMessage);
            let existingOrder = OrderRepository.findById(order.salesId);
            if (order.salesId && order.status) {
                if (order.status && order.status !== existingOrder.status) { 
                    existingOrder.status = order.status;
                    existingOrder.updatedAt = new Date();
                   await OrderRepository.save(existingOrder);
                }
            } else {
                console.log("The order message was not complete.");
            }     
        } catch (error) {
            console.error('Could not parse order message from queue');
            console.error(error.message);
         }
    }
     validateOrderData(data) {
        if (!data || !data.products) {
            throw new OrderException(BAD_REQUEST, 'The products must to be informeted.');
        }
     }
    
    async validateProductStock(order, token) {
        let stockIsOut = await ProductClient(order, token);
        if (stockIsOut) {
            throw new OrderException(BAD_REQUEST, 'The stock is not available for this product.');
        }
    }

    sendMessage(order) {
        const message = {
            salesId: order.id,
            products: order.products
        }
        sendMessageToProductStockUpdateQueue(message);
    }
}

export default new OrderService();