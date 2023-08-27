import OrderRepository from "../repository/OrderRepository.js";
import { sendMessageToProductStockUpdateQueue } from "../../product/rabbitmq/productStockUpdateSender.js";
import { INTERNAL_SERVER_ERROR, SUCCESS, BAD_REQUEST } from "../../../config/constants/httpStatus.js";
import { PENDING } from "../status/orderStatus.js";
import OrderException from "../exception/OrderException.js";
import ProductClient from "../../product/client/ProductClient.js";

class OrderService {
    async createOrder(req) {
        try {
            let orderData = req.body;
            this.validateOrderData(orderData);
            const { authUser } = req;
            const { authorization } = req.headers;
            let order = this.createInitialOrderData(orderData, authUser);
           await  this.validateProductStock(order, authorization);
            let createdOrder = await OrderRepository.save(order);
            this.sendMessage(createdOrder);

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
                products: orderData.products
        }
    }
    async updateOrder(orderMessage) {
        try {
            const order = JSON.parse(orderMessage);
            if (order.salesId && order.status) {
                let existingOrder = await OrderRepository.findById(order.salesId);
                if (existingOrder && order.status !== existingOrder.status) {
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
        let stockIsOk = await ProductClient.checkProductStock(
            order,
            token,
          );
            if (!stockIsOk) {
            throw new OrderException(
                BAD_REQUEST,
                "The stock is out for the products."
            );
            }
    }

    sendMessage(order) {
        const message = {
            salesId: order.id,
            products: order.products
        }
        sendMessageToProductStockUpdateQueue(message);
    }

    async findById(req) { 
        try {
            const { id } = req.params;
            this.validateInformedId(id);
            const existingOrder = await OrderRepository.findById(id);

            if (!existingOrder) {
                throw new OrderException(BAD_REQUEST, 'Order not found.');
            }
            return {
                status: SUCCESS,
                existingOrder
            };
        } catch (error) {
            return {
                status: error.status ? error.status : INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }
    }

    async findAll() { 
        try {
            const orders = await OrderRepository.findAll();

            if (!orders) {
                throw new OrderException(BAD_REQUEST, 'No Orders were found.');
            }
            return {
                status: SUCCESS,
                orders
            };
        } catch (error) {
            return {
                status: error.status ? error.status : INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }
    }

    async findByProductId(req) { 
        try {
            const { productId } = req.params;
            this.validateInformedId(productId);
            const existingOrder = await OrderRepository.findByProductId(productId);

            if (!existingOrder) {
                throw new OrderException(BAD_REQUEST, 'Order not found.');
            }
            return {
                status: SUCCESS,
                salesIds: existingOrder.map(order => {
                    return order.id
                }),
            };
        } catch (error) {
            return {
                status: error.status ? error.status : INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }
    }

    validateInformedId(id) {
        if (!id) {
            throw new OrderException(BAD_REQUEST, 'Id must be provided.');
        }
    }
}

export default new OrderService();