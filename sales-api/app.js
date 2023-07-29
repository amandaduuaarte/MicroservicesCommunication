import express from 'express';

const app = express();
const env = process.env;
const PORT = env.PORT || 3031;

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