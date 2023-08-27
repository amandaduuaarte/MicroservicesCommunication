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
            const { transactionid, serviceid } = req.headers;
            console.info(`Request to POST new Order with data ${JSON.stringify(orderData)} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
        
            this.validateOrderData(orderData);
            const { authUser } = req;
            const { authorization } = req.headers;
            let order = this.createInitialOrderData(orderData, authUser, transactionid, serviceid);
           await  this.validateProductStock(order, authorization, transactionid);
            let createdOrder = await OrderRepository.save(order);
            this.sendMessage(createdOrder, transactionid);

            const response = {
                status: SUCCESS,
                createdOrder
            };
            console.info(`Response to POST new Order with data ${JSON.stringify(response)} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            return response;
        } catch (error) {
            return {
                status: error.status ? error.status : INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }
    }

    createInitialOrderData(orderData, authUser, transactionid, serviceid) {
        return {
                status: PENDING,
                user: authUser,
                createdAt: new Date(),
                updatedAt: new Date(),
                transactionId: transactionid,
                serviceId: serviceid,
                products: orderData.products,
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
                console.log(`The order message was not complete. TransactionId ${orderMessage.transactionId}`);
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
    
    async validateProductStock(order, token, transactionid) {
        let stockIsOk = await ProductClient.checkProductStock(
            order,
            token,
            transactionid,
          );
            if (!stockIsOk) {
            throw new OrderException(
                BAD_REQUEST,
                "The stock is out for the products."
            );
            }
    }

    sendMessage(order, transactionid) {
        const message = {
            salesId: order.id,
            products: order.products,
            transactionId: transactionid
        }
        sendMessageToProductStockUpdateQueue(message);
    }

    async findById(req) { 
        try {
            const { id } = req.params;
            const { transactionid, serviceid } = req.headers;
            console.info(`Request to get Order by ID ${id} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            this.validateInformedId(id);
            const existingOrder = await OrderRepository.findById(id);

            if (!existingOrder) {
                throw new OrderException(BAD_REQUEST, 'Order not found.');
            }
            const response =  {
                status: SUCCESS,
                existingOrder
            };
            console.info(`Response to get Order by id ${id}: ${JSON.stringify(response)} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            return response;
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
            const { transactionid, serviceid } = req.headers;
            console.info(`Request to get all Orders | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            if (!orders) {
                throw new OrderException(BAD_REQUEST, 'No Orders were found.');
            }
            const response =  {
                status: SUCCESS,
                orders
            };
            console.info(`Response to get all Orders: ${JSON.stringify(response)} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            return response; 
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
            const { transactionid, serviceid } = req.headers;
            console.info(`Request to get Orders by productID ${productId} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            this.validateInformedId(productId);
            const existingOrder = await OrderRepository.findByProductId(productId);

            if (!existingOrder) {
                throw new OrderException(BAD_REQUEST, 'Order not found.');
            }
            const response = {
                status: SUCCESS,
                salesIds: existingOrder.map(order => {
                    return order.id
                }),
            };
            console.info(`Response to get Orders by productID ${productId}: ${JSON.stringify(response)} | [transactionID: ${transactionid} | serviceID: ${serviceid}]`);
            return response;
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