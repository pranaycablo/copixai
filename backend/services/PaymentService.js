const axios = require('axios');

class PaymentService {
    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID;
        this.secret = process.env.PAYPAL_SECRET;
        this.baseUrl = process.env.PAYPAL_MODE === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
    }

    async getAccessToken() {
        const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
        const response = await axios({
            url: `${this.baseUrl}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials'
        });
        return response.data.access_token;
    }

    async createOrder(amount, currency = 'USD') {
        const token = await this.getAccessToken();
        const response = await axios({
            url: `${this.baseUrl}/v2/checkout/orders`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toString()
                    }
                }]
            }
        });
        return response.data;
    }

    async captureOrder(orderId) {
        const token = await this.getAccessToken();
        const response = await axios({
            url: `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}

module.exports = new PaymentService();
