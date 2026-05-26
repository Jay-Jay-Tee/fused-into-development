import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
const BestSeller=()=>{
    const {products}=useContext(ShopContext);
    const [bestSeller,setBestSeller]=useState([]);
    useEffect(()=>{
        const top = [...products]
            .sort((a,b) => (b.rating||0) - (a.rating||0))
            .slice(0,5);
        setBestSeller(top);
    },[products])
    return(
        <div className='my-10'>
            <div className='text-center text-3xl py-8'>
                <Title text1={'BEST'} text2={'SELLERS'}/>
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-ink-soft'>
                    What people on your street are buying this week.
                </p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                {
                    bestSeller.map((item,index)=>(
                        <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId}/>
                    ))
                }
            </div>
        </div>
    )
}

export default BestSeller