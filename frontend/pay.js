/**
 * HEROAI PAYMENT HANDLER (V3 PRO)
 * Handles PayPal Integration and Plan Upgrades
 */

const PAYPAL_CLIENT_ID = "AbgM_oS4ZR3nmEaWgjzpAEA4SDOS7WDAqp-h_gEuLEYcp0c6dkEjC1eojq_iMH1NTeONzZ4-J4C9Vlnq";

// Load PayPal SDK dynamically
function loadPayPalSDK() {
    if (window.paypal) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Initiate Payment Flow
 * @param {string} planId - gro, pro, business, agency
 * @param {number} priceInINR - Amount in INR
 */
async function handleSelectPlan(planId, priceInINR) {
    const amountInUSD = (priceInINR / 83).toFixed(2); // Simple conversion for PayPal
    
    // Show Loading Toast
    if (window.toast) toast('info', 'Secure Checkout', 'Initializing PayPal Gateway...');

    try {
        await loadPayPalSDK();
        
        // Open PayPal Modal or Buttons
        // For simplicity in this UI, we'll use a hidden container for the buttons
        // or trigger the PayPal popup directly if using the API.
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/payment/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storage.get('token')}`
            },
            body: JSON.stringify({ amount: amountInUSD, planId })
        });

        const order = await response.json();

        if (order.id) {
            // Use PayPal SDK to authorize
            paypal.Buttons({
                createOrder: () => order.id,
                onApprove: async (data, actions) => {
                    const captureRes = await fetch(`${CONFIG.API_BASE_URL}/payment/capture-order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${storage.get('token')}`
                        },
                        body: JSON.stringify({ orderId: data.orderID, planId })
                    });
                    
                    const result = await captureRes.json();
                    if (result.message === 'Payment Successful') {
                        toast('success', 'Welcome to Pro!', 'Your account has been upgraded successfully.');
                        setTimeout(() => window.location.reload(), 2000);
                    }
                },
                onError: (err) => {
                    console.error(err);
                    toast('error', 'Payment Failed', 'Something went wrong with the transaction.');
                }
            }).render('#paypal-button-container-' + planId);
            
            // Show the container
            document.getElementById('paypal-button-container-' + planId).style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        toast('error', 'Checkout Error', 'Unable to connect to PayPal.');
    }
}

