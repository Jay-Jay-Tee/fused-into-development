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

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

const Home = () => {
  return (
    <div>
        <Hero />
        <FeaturedCategories />
        <LatestCollection />
        <RecommendedSection />
        <BestSeller />
        <OurPolicy/>
        <NewsletterBox/>
    </div>
  )
}

export default Home