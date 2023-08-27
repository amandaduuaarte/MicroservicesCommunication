import axios from 'axios';

import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";

class ProductClient {
    async checkProductStock(products, token) {
        try {
            const headers = {
                Authorization: token
            };
            console.info(`Seding request to PRODUCT API with data: ${JSON.stringify(products)}`);

            let response = true;
            await axios
                .post(`${PRODUCT_API_URL}/check-stock`,
                {products: products.products},
                { headers }
               )
                .then(response => {
                    response = true;
                })
                .catch(err => {
                    console.error(err.response.message);
                    response = false;
                });
            return response;
        } catch (error) {
            return false;
        }
    }
}

export default new ProductClient();