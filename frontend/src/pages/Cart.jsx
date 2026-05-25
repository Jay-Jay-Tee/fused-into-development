import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useNavigate } from 'react-router-dom'
import { formatINR } from '../utils/money'

const Cart = () => {
    const {products,cartItems,updateQuantity}=useContext(ShopContext);
    const [cartData,setCartData]=useState([]);
    const navigate=useNavigate();
    useEffect(()=>{
        const tempData=[];
        for (const items in cartItems){
            for (const item in cartItems[items]){
                if (cartItems[items][item]>0){
                    tempData.push({
                        _id:items,
                        size:item,
                        quantity:cartItems[items][item]
                    })
                }
            }
        }
        setCartData(tempData);
    },[cartItems])
    const groupedByVendor = cartData.reduce((acc,item)=>{
        const product=products.find(p=>p._id===item._id);
        if (!product)return acc;
        const vendor=product.vendor;
        if (!acc[vendor]){
            acc[vendor]={location:product.location,items:[]};
        }
        acc[vendor].items.push({...item, product});
        return acc;
    },{});
    return (
        <div className='border-t border-line pt-14'>
            <div className='text-2xl mb-6'>
                <Title text1={'YOUR'} text2={'CART'}/>
            </div>
            {cartData.length === 0?(
                <div className='text-center py-20'>
                    <p className='text-ink-soft mb-6'>Your cart is empty.</p>
                    <button onClick={()=>navigate('/collection')} className='bg-ink text-paper px-8 py-3 text-sm hover:bg-navy transition-colors'>
                        START SHOPPING
                    </button>
                </div>
            ):(
                <>
                    {Object.keys(groupedByVendor).map((vendor)=>(
                        <div key={vendor} className='mb-8 border border-line'>
                            <div className='bg-paper border-b border-line px-4 py-3 flex items-center justify-between'>
                                <div>
                                    <p className='text-xs text-ink-soft'>SOLD BY</p>
                                    <p className='font-medium'>{vendor} <span className='text-ink-soft text-sm font-normal'>· 📍 {groupedByVendor[vendor].location}</span></p>
                                </div>
                                <p className='text-xs text-ink-soft'>{groupedByVendor[vendor].items.length} item(s)</p>
                            </div>
                            <div>
                                {groupedByVendor[vendor].items.map((item, index)=>(
                                    <div key={index} className='py-4 px-4 border-b border-line last:border-b-0 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                                        <div className='flex items-start gap-6'>
                                            <img className='w-16 sm:w-20' src={item.product.image[0]} alt="" />
                                            <div>
                                                <p className='text-sm sm:text-lg font-medium'>{item.product.name}</p>
                                                <div className='flex items-center gap-5 mt-2'>
                                                    <p className='text-sm'>{formatINR(item.product.price)}</p>
                                                    {item.size !== 'default' && (
                                                        <p className='px-2 sm:px-3 py-0.5 border border-line bg-paper text-xs'>{item.size}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <input onChange={(e)=>e.target.value===''||e.target.value==='0'?null:updateQuantity(item._id,item.size,Number(e.target.value))} className='border border-line max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-sm' type='number' min={1} value={item.quantity}/>
                                        <img onClick={()=>updateQuantity(item._id,item.size,0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className='flex justify-end my-20'>
                        <div className='w-full sm:w-[450px]'>
                            <CartTotal/>
                            <div className='w-full text-end'>
                                <button onClick={()=>navigate('/place-order')} className='bg-ink text-paper text-sm my-8 px-8 py-3 hover:bg-navy transition-colors'>
                                    PROCEED TO CHECKOUT
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Cart