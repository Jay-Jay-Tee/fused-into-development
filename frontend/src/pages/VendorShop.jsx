import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import ProductItem from '../components/ProductItem'

const VendorShop = () => {

    const { vendorName } = useParams();
    const { products } = useContext(ShopContext);
    const navigate = useNavigate();

    const [vendorProducts, setVendorProducts] = useState([]);
    const [vendorInfo, setVendorInfo] = useState(null);

    useEffect(()=>{
        const decoded = decodeURIComponent(vendorName);
        const filtered = products.filter(p => p.vendor === decoded);
        setVendorProducts(filtered);

        if (filtered.length > 0){
            const avgRating = filtered.reduce((sum, p) => sum + p.rating, 0) / filtered.length;
            const totalStock = filtered.reduce((sum, p) => sum + p.stock, 0);
            // Backend wiring later - score will come from /api/vendors/:id
            const score = Math.min(100, Math.round(avgRating * 18 + 10));
            setVendorInfo({
                name: decoded,
                location: filtered[0].location,
                productCount: filtered.length,
                avgRating: avgRating.toFixed(1),
                totalStock,
                score,
                joinedYear: 2024,
            });
        } else {
            setVendorInfo(null);
        }
        window.scrollTo(0,0);
    },[vendorName, products])

    const getScoreColor = (score) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-mustard';
        return 'bg-brick';
    }

    if (!vendorInfo){
        return (
            <div className='border-t border-line pt-16 text-center min-h-[60vh] flex flex-col items-center justify-center'>
                <p className='font-display text-4xl mb-4'>Shop not found</p>
                <p className='text-ink-soft mb-6'>This vendor doesn't exist or has no active products.</p>
                <button onClick={()=>navigate('/collection')} className='bg-ink text-paper px-6 py-3 text-sm hover:bg-navy transition-colors'>
                    Browse all products
                </button>
            </div>
        )
    }

    return (
        <div className='border-t border-line pt-10'>

            {/* Vendor header */}
            <div className='bg-navy text-paper p-8 md:p-12 mb-8'>
                <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
                    <div>
                        <div className='flex items-center gap-3 mb-3'>
                            <p className='font-mono text-xs tracking-widest'>VERIFIED VENDOR</p>
                            <span className={`text-[10px] text-paper px-2 py-0.5 ${getScoreColor(vendorInfo.score)}`}>
                                SCORE {vendorInfo.score}
                            </span>
                        </div>
                        <h1 className='font-display text-4xl md:text-5xl mb-2'>{vendorInfo.name}</h1>
                        <p className='text-paper/80'>📍 {vendorInfo.location} · Since {vendorInfo.joinedYear}</p>
                    </div>

                    <div className='grid grid-cols-3 gap-6 text-center'>
                        <div>
                            <p className='font-display text-2xl'>{vendorInfo.productCount}</p>
                            <p className='text-xs text-paper/60 tracking-wider'>PRODUCTS</p>
                        </div>
                        <div>
                            <p className='font-display text-2xl'>{vendorInfo.avgRating}★</p>
                            <p className='text-xs text-paper/60 tracking-wider'>AVG RATING</p>
                        </div>
                        <div>
                            <p className='font-display text-2xl'>{vendorInfo.totalStock}</p>
                            <p className='text-xs text-paper/60 tracking-wider'>IN STOCK</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor story - placeholder */}
            <div className='max-w-2xl mb-12'>
                <p className='text-xs text-ink-soft tracking-wider mb-2'>ABOUT THIS SHOP</p>
                <p className='text-sm text-ink-soft'>
                    Locally crafted, shipped from {vendorInfo.location}. {vendorInfo.name} has been part of VendorHub since {vendorInfo.joinedYear}, with {vendorInfo.productCount} active products and consistently strong buyer ratings.
                </p>
            </div>

            {/* Products grid */}
            <div>
                <p className='text-lg font-medium mb-4'>Products from this shop</p>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                    {vendorProducts.map((item)=>(
                        <ProductItem key={item._id} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} location={item.location}/>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default VendorShop