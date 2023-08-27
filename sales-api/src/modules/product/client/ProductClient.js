import axios from 'axios';

import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";

class ProductClient {
    async checkProductStock(products, token, transactionid) {
        try {
            const headers = {
                Authorization: token,
                transactionid
            };
            console.info(`Seding request to PRODUCT API with data: ${JSON.stringify(products)} and transactionid: ${transactionid}`);

            let response = true;
            await axios
                .post(`${PRODUCT_API_URL}/check-stock`,
                {products: products.products},
                { headers }
               )
                .then(response => {
                    console.info(`Success response from PRODUCT API. Transactionid: ${transactionid}`);
                    response = true;
                })
                .catch(err => {
                    console.error(`Error response from PRODUCT API. Transactionid: ${transactionid}`);
                    response = false;
                });
            return response;
        } catch (error) {
            console.error(`Error response from PRODUCT API. Transactionid: ${transactionid}`);
            return false;
        }
    }
}

export default new ProductClient();