import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import { ShopContext } from '../context/ShopContext'
import { getRecommendations } from '../api/ai'

import { API } from '../api/config.js'

const FeaturedCategories = () => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        axios.get(`${API}/categories`)
            .then(res => setCategories((res.data || []).slice(0, 6)))
            .catch(() => {});
    }, []);
    if (categories.length === 0) return null;
    return (
        <div className='my-10'>
            <Title text1={'SHOP BY'} text2={'CATEGORY'} />
            <div className='grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6'>
                {categories.map(c => (
                    <Link key={c._id} to='/collection' className='flex flex-col items-center gap-2 py-5 border border-line hover:border-navy hover:bg-line transition-colors text-center'>
                        <p className='text-sm font-medium'>{c.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const RecommendedSection = () => {
    const { token, products } = useContext(ShopContext);
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || products.length === 0) return;
        setLoading(true);
        const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').slice(0, 5);
        const recentProducts = recentIds
            .map(id => products.find(p => p._id === id))
            .filter(Boolean);
        const orderCategories = [...new Set(recentProducts.map(p => p.category).filter(Boolean))];
        getRecommendations(recentIds, orderCategories)
            .then(data => {
                const recProducts = data
                    .map(r => products.find(p => p._id === r.productId))
                    .filter(Boolean);
                setRecs(recProducts);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token, products]);

    if (!token) return null;
    if (!loading && recs.length === 0) return null;

    return (
        <div className='my-10'>
            <Title text1={'RECOMMENDED'} text2={'FOR YOU'} />
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6'>
                {loading
                    ? [...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)
                    : recs.map(item => (
                        <ProductItem key={item._id} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId} />
                    ))
                }
            </div>
        </div>
    );
};

const VendorCTA = () => (
    <div className='my-16 border border-line bg-paper'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10'>
            <div>
                <p className='text-xs text-ink-soft tracking-wider mb-2'>FOR SELLERS</p>
                <h2 className='text-2xl font-medium mb-2'>Sell on VendorHub</h2>
                <p className='text-ink-soft text-sm max-w-md'>Have a small business? Reach thousands of buyers in your city. Setup takes 5 minutes  -  list your first product today.</p>
            </div>
            <a
                href={`${import.meta.env.VITE_VENDOR_URL || 'http://localhost:5174'}/register`}
                target='_blank'
                rel='noreferrer'
                className='shrink-0 bg-ink text-paper px-8 py-3 text-sm hover:bg-navy transition-colors'
            >
                Become a Vendor
            </a>
        </div>
    </div>
);

const Home = () => {
  return (
    <div>
        <Hero />
        <FeaturedCategories />
        <LatestCollection />
        <RecommendedSection />
        <BestSeller />
        <OurPolicy/>
        <VendorCTA />
        <NewsletterBox/>
    </div>
  )
}

export default Home