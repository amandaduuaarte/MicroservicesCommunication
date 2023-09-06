import express from 'express';
import { connectMongoDb } from './src/config/db/mongoDbConfig.js';
import {createInitialData} from "./src/config/db/initialData.js"
import checkToken from './src/config/auth/checkToken.js';

import { connectRabbitMq } from './src/config/rabbitmq/rabbitConfig.js';
import { sendMessageToProductStockUpdateQueue } from './src/modules/product/rabbitmq/productStockUpdateSender.js'
import OrderRouter from "./src/modules/sales/router/OrderRoutes.js";

import tracing from './src/config/tracing.js';

const app = express();
const env = process.env;
const PORT = env.PORT || 3031;
const CONTAINER_ENV = "container";

connectMongoDb();
connectRabbitMq();

app.use(express.json());

startAplication();

function startAplication() {
    if (env.NODE_ENV !== CONTAINER_ENV) {
        createInitialData();
    }
}

app.get('/api/initial-data', (req, res) => {
    createInitialData();
    return res.status(200).json({
        message: 'Data was successfully created.'
    });
});

app.use(tracing);
app.use(checkToken);
app.use(OrderRouter);
app.get('/teste', (req, res) => {
    try {
        sendMessageToProductStockUpdateQueue([
            {
                productId: 1001,
                quantity: 2,
            },
            {
                productId: 1003,
                quantity: 3,
          }
        ]);
        return res.status(200).json({ status: 200 });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: true });
    }
});

app.get('/api/status', (req, res) => {
    return res.status(200).json({
        service: 'sales-api',
        status: 'on',
        httpStatus: 200
    });
});


app.listen(PORT, () => {
    console.info(`Server listening on ${PORT}`);
})