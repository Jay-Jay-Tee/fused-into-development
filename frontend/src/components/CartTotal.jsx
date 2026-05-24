import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import { formatINR } from '../utils/money'

const CartTotal = () => {
    const {delivery_fee,getCartAmount}=useContext(ShopContext);
    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTALS'}/>
            </div>
            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{formatINR(getCartAmount())}</p>
                </div>
                <hr className='border-line'/>
                <div className='flex justify-between'>
                    <p>Shipping fee</p>
                    <p>{formatINR(getCartAmount()===0 ? 0 : delivery_fee)}</p>
                </div>
                <hr className='border-line'/>
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{formatINR(getCartAmount()===0 ? 0 : getCartAmount()+delivery_fee)}</b>
                </div>
            </div>
        </div>
    )
}

export default CartTotal