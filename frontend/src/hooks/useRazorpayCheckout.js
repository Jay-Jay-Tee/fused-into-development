import { useCallback } from 'react';
import api from '../api/axiosInstance';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const createPaymentSession = async (orderId) => {
    const res = await api.post('/payments/create-order', { orderId, paymentType: 'razorpay' });
    return res.data.data;
};

const verifyPayment = (orderId, response) =>
    api.post('/payments/verify', {
        paymentType: 'razorpay',
        orderId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
    });

const openCheckout = (orderId, session) =>
    new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: session.amount,
            currency: session.currency,
            name: 'VendorHub',
            order_id: session.razorpayOrderId,
            handler: async (response) => {
                try {
                    await verifyPayment(orderId, response);
                    resolve();
                } catch {
                    reject(new Error('Payment verification failed. Contact support.'));
                }
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
            theme: { color: '#1A1A1A' },
        });
        rzp.on('payment.failed', (resp) =>
            reject(new Error(resp.error?.description || 'Payment failed'))
        );
        rzp.open();
    });

export const useRazorpayCheckout = () => {
    const pay = useCallback(async (order) => {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load Razorpay. Check your connection.');

        const session = await createPaymentSession(order._id);
        await openCheckout(order._id, session);
    }, []);

    return { pay };
};
