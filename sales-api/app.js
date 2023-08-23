import express from 'express';
import { connectMongoDb } from './src/config/db/mongoDbConfig.js';
import {createInitialData} from "./src/config/db/initialData.js"
import checkToken from './src/config/auth/checkToken.js';
import { connectRabbitMq } from './src/config/rabbitmq/rabbitConfig.js';

const app = express();
const env = process.env;
const PORT = env.PORT || 3031;

connectMongoDb();
createInitialData();
connectRabbitMq();

app.use(checkToken);
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