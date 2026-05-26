import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import { useNavigate } from 'react-router-dom'

const Wishlist = () => {

    const {products, wishlist} = useContext(ShopContext);
    const navigate = useNavigate();

    const wishlistedProducts = products.filter(p => wishlist.includes(p._id));

    return (
        <div className='border-t border-line pt-14'>
            <div className='text-2xl mb-6'>
                <Title text1={'YOUR'} text2={'WISHLIST'}/>
            </div>

            {wishlistedProducts.length === 0 ? (
                <div className='text-center py-20'>
                    <p className='text-ink-soft mb-6'>You haven't saved anything yet. Tap the heart on any product to add it.</p>
                    <button onClick={()=>navigate('/collection')} className='bg-ink text-paper px-8 py-3 text-sm hover:bg-navy transition-colors'>
                        BROWSE COLLECTION
                    </button>
                </div>
            ) : (
                <>
                    <p className='text-sm text-ink-soft mb-6'>{wishlistedProducts.length} item{wishlistedProducts.length !== 1 ? 's' : ''} saved</p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                        {wishlistedProducts.map((item)=>(
                            <ProductItem key={item._id} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId}/>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default Wishlist