import axios from 'axios';

import { PRODUCT_API_URL } from "../../../config/constants/secrets.js";

class ProductClient {
    async checkProductStock(products, token) {
        try {
            const headers = {
                Authorization: `Bearer ${token}`
            };
            console.info(`Seding request to PRODUCT API with data: ${JSON.stringify(products)}`);

            axios.post(`${PRODUCT_API_URL}/check-stock`, { headers }, products)
                .then(response => {
                    return true;
                })
                .catch(err => {
                    console.error(err.response.message);
                    return false;
                });
        } catch (error) {
            return false;
        }
    }
}

export default new ProductClient();