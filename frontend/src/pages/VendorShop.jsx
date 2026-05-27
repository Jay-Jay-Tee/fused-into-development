import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductItem from '../components/ProductItem'
import axios from 'axios'

import { API } from '../api/config.js'

const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-mustard';
    return 'bg-brick';
}

const VendorShop = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!vendorId) return;
        setLoading(true);
        Promise.all([
            axios.get(`${API}/vendors/${vendorId}`),
            axios.get(`${API}/products?vendor=${vendorId}&limit=50`),
        ])
            .then(([vendorRes, productsRes]) => {
                setVendor(vendorRes.data);
                setProducts((productsRes.data.products || []).map(p => ({
                    ...p,
                    image: p.images || [],
                    rating: p.averageRating || 0,
                    vendor: p.vendor?.storeName || '',
                    vendorId: p.vendor?._id || vendorId,
                    category: p.category?.name || '',
                })));
            })
            .catch(() => { setVendor(null); setProducts([]); })
            .finally(() => setLoading(false));
        window.scrollTo(0, 0);
    }, [vendorId]);

    if (loading) {
        return (
            <div className='border-t border-line pt-16 text-center min-h-[60vh] flex flex-col items-center justify-center text-ink-soft'>
                <p>Loading shop...</p>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className='border-t border-line pt-16 text-center min-h-[60vh] flex flex-col items-center justify-center'>
                <p className='font-display text-4xl mb-4'>Shop not found</p>
                <p className='text-ink-soft mb-6'>This vendor doesn't exist or has no active products.</p>
                <button onClick={() => navigate('/collection')} className='bg-ink text-paper px-6 py-3 text-sm hover:bg-navy transition-colors'>
                    Browse all products
                </button>
            </div>
        );
    }

    const score = Math.min(100, Math.round((vendor.averageRating || 0) * 18 + 10));
    const joinedYear = new Date(vendor.createdAt || Date.now()).getFullYear();

    return (
        <div className='border-t border-line pt-10'>
            <div className='bg-navy text-paper p-8 md:p-12 mb-8'>
                <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
                    <div className='flex items-start gap-4'>
                        {vendor.logo && (
                            <img src={vendor.logo} alt={vendor.storeName} className='w-16 h-16 object-cover rounded-sm border border-paper/20'/>
                        )}
                        <div>
                            <div className='flex items-center gap-3 mb-3'>
                                <p className='font-mono text-xs tracking-widest'>VERIFIED VENDOR</p>
                                <span className={`text-[10px] text-paper px-2 py-0.5 ${getScoreColor(score)}`}>
                                    SCORE {score}
                                </span>
                            </div>
                            <h1 className='font-display text-4xl md:text-5xl mb-2'>{vendor.storeName}</h1>
                            <p className='text-paper/80'>Since {joinedYear}</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-3 gap-6 text-center'>
                        <div>
                            <p className='font-display text-2xl'>{products.length}</p>
                            <p className='text-xs text-paper/60 tracking-wider'>PRODUCTS</p>
                        </div>
                        <div>
                            <p className='font-display text-2xl'>{(vendor.averageRating || 0).toFixed(1)} stars</p>
                            <p className='text-xs text-paper/60 tracking-wider'>AVG RATING</p>
                        </div>
                        <div>
                            <p className='font-display text-2xl'>{vendor.totalReviews || 0}</p>
                            <p className='text-xs text-paper/60 tracking-wider'>REVIEWS</p>
                        </div>
                    </div>
                </div>
            </div>

            {vendor.storeDescription && (
                <div className='max-w-2xl mb-12'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>ABOUT THIS SHOP</p>
                    <p className='text-sm text-ink-soft'>{vendor.storeDescription}</p>
                </div>
            )}

            <div>
                <p className='text-lg font-medium mb-4'>Products from this shop</p>
                {products.length === 0 ? (
                    <div className='text-center py-20 text-ink-soft text-sm'>No active products.</div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                        {products.map((item) => (
                            <ProductItem key={item._id} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorShop
