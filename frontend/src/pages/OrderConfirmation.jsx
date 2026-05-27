import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Title from '../components/Title'
import { formatINR } from '../utils/money'

const OrderConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const orderId = state?.orderId;
    const totalAmount = state?.totalAmount;

    return (
        <div className='border-t border-line pt-16 min-h-[70vh] flex flex-col items-center justify-center text-center px-4'>
            <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6'>
                <span className='text-green-600 text-3xl'>✓</span>
            </div>

            <div className='text-2xl mb-2'>
                <Title text1={'ORDER'} text2={'CONFIRMED'} />
            </div>

            <p className='text-ink-soft mt-2 mb-6 max-w-sm'>
                Your payment was successful and your order has been placed. You'll receive updates as it's prepared and shipped.
            </p>

            {orderId && (
                <p className='text-sm text-ink-soft mb-2'>
                    Order ID: <span className='font-mono font-medium text-ink'>{orderId.slice(-10).toUpperCase()}</span>
                </p>
            )}
            {totalAmount > 0 && (
                <p className='text-sm text-ink-soft mb-8'>
                    Amount paid: <span className='font-medium text-ink'>{formatINR(totalAmount)}</span>
                </p>
            )}

            <div className='flex gap-4'>
                <Link to='/orders' className='bg-ink text-paper px-8 py-3 text-sm hover:bg-navy transition-colors'>
                    VIEW ORDERS
                </Link>
                <Link to='/' className='border border-ink px-8 py-3 text-sm hover:bg-ink hover:text-paper transition-colors'>
                    CONTINUE SHOPPING
                </Link>
            </div>
        </div>
    )
}

export default OrderConfirmation
