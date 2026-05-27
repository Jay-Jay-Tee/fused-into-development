import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useNavigate } from 'react-router-dom'
import { formatINR } from '../utils/money'

const ProductItem = ({id, image, name, price, vendor, vendorId}) => {
    const {wishlist, toggleWishlist} = useContext(ShopContext);
    const isWishlisted = wishlist.includes(id);
    const navigate = useNavigate();

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
    }

    return (
        <Link to={`/product/${id}`} className='text-ink cursor-pointer group block relative'>
            <button
                onClick={handleWishlistClick}
                className='absolute top-2 right-2 z-10 w-8 h-8 bg-paper border border-line flex items-center justify-center hover:bg-mustard transition-colors'
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={`h-4 w-4 transition-colors ${isWishlisted ? 'text-brick' : 'text-ink-soft'}`}
                    fill={isWishlisted ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M20.8 4.6c-1.7-1.9-4.5-2-6.3-.3L12 6.7l-2.5-2.4c-1.8-1.7-4.6-1.6-6.3.3-1.9 2-1.8 5.2.2 7.1L12 21l8.6-9.3c2-1.9 2.1-5.1.2-7.1Z" />
                </svg>
            </button>
            <div className='overflow-hidden bg-line aspect-[3/4]'>
                <img className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' src={image} alt={name} />
            </div>
            <p className='pt-3 pb-1 text-sm font-medium'>{name}</p>
            <p
                onClick={(e)=>{e.preventDefault(); e.stopPropagation(); if(vendorId) navigate(`/vendor/${vendorId}`)}}
                className='text-xs text-ink-soft mb-1 hover:text-ink hover:underline cursor-pointer'
            >
                {vendor}
            </p>
            <p className='text-sm font-semibold'>{formatINR(price)}</p>
        </Link>
    )
}

export default ProductItem