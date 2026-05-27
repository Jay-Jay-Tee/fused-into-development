import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/orders/vendor`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.orders || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const statusHandler = async (e, orderId) => {
        const status = e.target.value;
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API}/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
            toast.success('Status updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center py-20'>
                <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'/>
            </div>
        );
    }

    return (
        <div>
            <h3 className='mb-4 font-medium'>Orders</h3>
            <div>
                {orders.map((order) => (
                    <div key={order._id} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-line p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-ink-soft'>

                        <img className='w-12' src={assets.parcel_icon} alt=""/>

                        <div>
                            <div>
                                {(order.items || []).map((item, index) => (
                                    <p key={index} className='py-0.5'>
                                        {item.name} x {item.quantity}
                                        {index !== order.items.length - 1 && ','}
                                    </p>
                                ))}
                            </div>
                            {order.shippingAddress && (
                                <>
                                    <p className='mt-3 mb-2 font-medium text-ink'>
                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                    </p>
                                    <div>
                                        <p>{order.shippingAddress.street},</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country} - {order.shippingAddress.pincode}</p>
                                    </div>
                                    <p className='mt-1'>{order.shippingAddress.phone}</p>
                                </>
                            )}
                        </div>

                        <div>
                            <p className='text-sm sm:text-[15px]'>Items: {(order.items || []).length}</p>
                            <p className='mt-3'>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>

                        <p className='text-sm sm:text-[15px] font-medium text-ink'>{formatINR(order.totalAmount)}</p>

                        <select
                            onChange={(e) => statusHandler(e, order._id)}
                            value={order.orderStatus}
                            className='p-2 font-semibold border border-line bg-paper outline-none focus:border-navy capitalize'
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className='text-center py-12 text-ink-soft text-sm'>
                        <p>No incoming orders yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders
