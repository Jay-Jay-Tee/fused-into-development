import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { formatINR } from '../utils/money'

const ProductItem = ({id, image, name, price, vendor, location}) => {
    const {wishlist, toggleWishlist} = useContext(ShopContext);
    const isWishlisted = wishlist.includes(id);

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
                <span className={isWishlisted ? 'text-brick' : 'text-ink-soft'}>{isWishlisted ? '♥' : '♡'}</span>
            </button>
            <div className='overflow-hidden bg-line aspect-[3/4]'>
                <img className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' src={image} alt={name} />
            </div>
            <p className='pt-3 pb-1 text-sm font-medium'>{name}</p>
            <p className='text-xs text-ink-soft mb-1'>{vendor} · {location}</p>
            <p className='text-sm font-semibold'>{formatINR(price)}</p>
        </Link>
    )
}

export default ProductItem