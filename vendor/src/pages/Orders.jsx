import React, { useState, useEffect } from 'react'
import { mockOrders } from '../assets/assets'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'

const Orders = () => {

    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        // Backend wiring later
        setOrders(mockOrders);
    }

    const statusHandler = async (event, orderId) => {
        // Backend wiring later
        setOrders(prev => prev.map(order =>
            order._id === orderId ? {...order, status: event.target.value} : order
        ));
        toast.success('Status updated');
    }

    useEffect(()=>{
        fetchOrders();
    },[])

    return (
        <div>
            <h3 className='mb-4 font-medium'>Order Page</h3>
            <div>
                {orders.map((order) => (
                    <div key={order._id} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-line p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-ink-soft'>

                        <img className='w-12' src={assets.parcel_icon} alt=""/>

                        <div>
                            <div>
                                {order.items.map((item, index) => (
                                    <p key={index} className='py-0.5'>
                                        {item.name} x {item.quantity} {item.size !== 'default' && <span>({item.size})</span>}
                                        {index !== order.items.length - 1 && ','}
                                    </p>
                                ))}
                            </div>
                            <p className='mt-3 mb-2 font-medium text-ink'>{order.address.firstName + ' ' + order.address.lastName}</p>
                            <div>
                                <p>{order.address.street + ','}</p>
                                <p>{order.address.city + ', ' + order.address.state + ', ' + order.address.country + ', ' + order.address.zipcode}</p>
                            </div>
                            <p className='mt-1'>{order.address.phone}</p>
                        </div>

                        <div>
                            <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
                            <p className='mt-3'>Method: {order.paymentMethod}</p>
                            <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>

                        <p className='text-sm sm:text-[15px] font-medium text-ink'>{formatINR(order.amount)}</p>

                        <select onChange={(e)=>statusHandler(e, order._id)} value={order.status} className='p-2 font-semibold border border-line bg-paper outline-none focus:border-navy'>
                            <option value='Order Placed'>Order Placed</option>
                            <option value='Packing'>Packing</option>
                            <option value='Shipped'>Shipped</option>
                            <option value='Out for delivery'>Out for delivery</option>
                            <option value='Delivered'>Delivered</option>
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
    )
}

export default Orders