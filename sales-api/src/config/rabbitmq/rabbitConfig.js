import amqp from 'amqplib/callback_api.js';
import { RABBIT_MQ_URL } from '../constants/secrets.js';
import {
    PRODUCT_TOPIC,
    PRODUCT_STOCK_UPDATE_QUEUE,
    PRODUCUT_STOCK_UPDATE_ROUTING_KEY,
    SALES_CONFIRMATION_QUEUE,
    SALES_CONFIRMATION_ROUTING_KEY
} from './queue.js';
import { listenToSalesConfirmationQueue } from '../../modules/sales/rabbitmq/salesConfirmationListener.js';

const TWO_SECOND = 2000;
const HALF_MINUTES = 300000;
export async function connectRabbitMq() {
    const env = process.env.NODE_ENV;
    if (env === 'container') {
        console.info('Waiting for RabbitMQ to start.');
        setInterval(() => {
            connectRabbitMqAndCreateQueues();
        }, HALF_MINUTES)
    } else {
         connectRabbitMqAndCreateQueues();
    }
}
   async function connectRabbitMqAndCreateQueues() {
        amqp.connect(RABBIT_MQ_URL, (error, connection) => {
            if (error) {
                throw error;
            }
            console.info('Starting RabbitMQ.');
            createQueue(
                connection,
                PRODUCT_STOCK_UPDATE_QUEUE,
                PRODUCUT_STOCK_UPDATE_ROUTING_KEY,
                PRODUCT_TOPIC);
            createQueue(
                connection,
                SALES_CONFIRMATION_QUEUE,
                SALES_CONFIRMATION_ROUTING_KEY,
                PRODUCT_TOPIC);
            
                console.info('Queues and Topics were defined.');
            setTimeout(() => {
                connection.close();
            }, TWO_SECOND);
        });
        setTimeout(() => {
            listenToSalesConfirmationQueue();
        }, TWO_SECOND);
      
    }
    function createQueue(connection, queue, routingKey, topic) { 
        connection.createChannel((error, channel) => {
            if (error) {
                throw error;
            }
            channel.assertExchange(topic, 'topic', { durable: true });
            channel.assertQueue(queue, { durable: true });
            channel.bindQueue(queue, topic, routingKey);
        })
    }