import Order from "../model/Order.js";

class OrderRepository {
    async save(order) {
        try {
            return await Order.create(order);
        } catch (error) {
            console.error(error);
            return 
        }
    } 

    async findById(id) {
        try {
            return await Order.findById(id);
        } catch (error) {
            console.error(error);
            return 
        }
    } 
    async findAll() {
        try {
            return await Order.find();
        } catch (error) {
            console.error(error);
            return 
        }
    } 
}

export default new OrderRepository();