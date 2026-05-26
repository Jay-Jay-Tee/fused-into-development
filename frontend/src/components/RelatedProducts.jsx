import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RelatedProducts=({category})=>{
    const {products}=useContext(ShopContext);
    const [related,setRelated]=useState([]);
    useEffect(()=>{
        if (products.length>0){
            const related = products
                .filter(item => category && item.category === category)
                .slice(0,5);
            setRelated(related);
        }
    },[products, category])
    return (
        <div className='my-24'>
            <div className='text-center text-3xl py-2'>
                <Title text1={'RELATED'} text2={'PRODUCTS'}/>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-6'>
                {related.map((item,index)=>(
                    <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId}/>
                ))}
            </div>
        </div>
    )
}

export default RelatedProducts