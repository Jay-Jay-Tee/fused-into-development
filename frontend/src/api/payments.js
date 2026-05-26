import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
});

export const createOrder = async ({ items, shippingAddress, token }) => {
    const response = await axios.post(
        `${API_URL}/orders`,
        { items, shippingAddress },
        { headers: authHeaders(token) }
    );
    return response.data;
};

export const createRazorpayOrder = async ({ orderId, token }) => {
    const response = await axios.post(
        `${API_URL}/payments/create-order`,
        { orderId },
        { headers: authHeaders(token) }
    );
    return response.data.data;
};

export const verifyRazorpayPayment = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    token,
}) => {
    const response = await axios.post(
        `${API_URL}/payments/verify`,
        { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature },
        { headers: authHeaders(token) }
    );
    return response.data.data;
};
