import express from 'express';

import createInitialData from "./src/config/db/initialData.js";
import userRoutes from "./src/modules/user/routes/userRoutes.js"

const app = express();
const env = process.env;
const PORT = env.PORT || 3030;

createInitialData();

app.use(express.json());

app.use(userRoutes);

app.get('/api/status', (req, res) => {
    return res.status(200).json({
        service: 'auth-api',
        status: 'on',
        httpStatus: 200
    });
});


app.listen(PORT, () => {
    console.info(`Server listening on ${PORT}`);
})