import express from 'express';
import { connect } from './src/config/db/mongoDbConfig.js';

const app = express();
const env = process.env;
const PORT = env.PORT || 3031;

connect();

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