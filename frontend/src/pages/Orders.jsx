import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import ReviewForm from '../components/ReviewForm'
import { formatINR } from '../utils/money'
import api from '../api/axiosInstance'

const STATUS_COLORS = {
    pending:   'bg-ink-soft',
    confirmed: 'bg-navy',
    shipped:   'bg-mustard',
    delivered: 'bg-green-500',
    cancelled: 'bg-brick',
}

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [reviewingItem, setReviewingItem] = useState(null) // { productId, productName }

    useEffect(() => {
        api.get('/orders/my')
            .then(res => setOrders(res.data.orders || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className='border-t border-line pt-16 text-center py-20 text-ink-soft'>
                <p>Loading orders...</p>
            </div>
        )
    }

    return (
        <div className='border-t border-line pt-16'>
            <div className='text-2xl mb-6'>
                <Title text1={'MY'} text2={'ORDERS'}/>
            </div>

            {orders.length === 0 ? (
                <div className='text-center py-20 text-ink-soft'>
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : orders.map((order) => (
                <div key={order._id} className='border border-line mb-4'>
                    {/* Order header */}
                    <div className='flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-line bg-paper'>
                        <div className='flex items-center gap-2'>
                            <p className={`w-2 h-2 rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-ink-soft'}`}/>
                            <p className='text-sm font-medium capitalize'>{order.orderStatus}</p>
                        </div>
                        <div className='flex gap-4 text-xs text-ink-soft'>
                            <p>Order: <span className='font-mono'>{order._id.slice(-8).toUpperCase()}</span></p>
                            <p>{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                            <p className='font-medium text-ink'>{formatINR(order.totalAmount)}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className='divide-y divide-line'>
                        {order.items.map((item, i) => (
                            <div key={i} className='py-4 px-4 text-ink-soft'>
                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                    <div className='flex items-start gap-4 text-sm'>
                                        {item.image && (
                                            <img className='w-16 sm:w-20 object-cover aspect-[3/4]' src={item.image} alt={item.name}/>
                                        )}
                                        <div>
                                            <p className='font-medium text-ink'>{item.name}</p>
                                            <div className='flex items-center gap-3 mt-1 text-xs'>
                                                <p>{formatINR(item.price)}</p>
                                                <p>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.orderStatus === 'delivered' && reviewingItem?.productId !== item.product?._id && (
                                        <button
                                            onClick={() => setReviewingItem({ productId: item.product?._id || item.product, productName: item.name })}
                                            className='border border-line text-sm font-medium px-4 py-2 hover:bg-ink hover:text-paper transition-colors self-start md:self-auto'
                                        >
                                            Leave review
                                        </button>
                                    )}
                                </div>

                                {reviewingItem?.productId === (item.product?._id || item.product) && (
                                    <ReviewForm
                                        productId={reviewingItem.productId}
                                        productName={reviewingItem.productName}
                                        onClose={() => setReviewingItem(null)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Shipping */}
                    {order.shippingAddress && (
                        <div className='px-4 py-3 border-t border-line text-xs text-ink-soft'>
                            <span className='tracking-wider'>SHIP TO: </span>
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName} · {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Orders
