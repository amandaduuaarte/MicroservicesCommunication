import ampq from 'amqplib/callback_api.js';
import { RABBIT_MQ_URL } from '../../../config/constants/secrets.js';

import { PRODUCT_TOPIC, PRODUCUT_STOCK_UPDATE_ROUTING_KEY } from '../../../config/rabbitmq/queue.js';


export function sendMessageToProductStockUpdateQueue(message) {
    ampq.connect(RABBIT_MQ_URL, (error, connection) => {
        if (error) {
            throw error;
        }
        let jsonStringMessage = JSON.stringify(message);
        connection.createChannel((error, channel) => {
            if (error) {
                throw error;
            }
            console.info(`Sending message to product update stock ${jsonStringMessage}`);
            channel.publish(
                PRODUCT_TOPIC,
                PRODUCUT_STOCK_UPDATE_ROUTING_KEY,
                Buffer.from(jsonStringMessage)
            );
            console.info(`Message was sent successfully.`);
        });
    });
}