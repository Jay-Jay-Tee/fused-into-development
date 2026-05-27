import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import ReviewForm from '../components/ReviewForm'
import { formatINR } from '../utils/money'
import axios from 'axios'

import { API } from '../api/config.js'

const ReviewsList = ({productId}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        if (!productId) return;
        axios.get(`${API}/reviews/product/${productId}`)
            .then(res => setReviews(res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    },[productId])

    if (loading) return <p className='text-center py-6 text-ink-soft text-sm'>Loading reviews...</p>;

    if (reviews.length === 0){
        return (
            <div className='text-center py-10 text-ink-soft'>
                <p>No reviews yet. Be the first to review.</p>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4'>
            {reviews.map((r) => (
                <div key={r._id} className='border-b border-line last:border-b-0 pb-4 last:pb-0'>
                    <div className='flex items-center gap-3 mb-2'>
                        <p className='text-mustard'>{'*'.repeat(r.rating)}<span className='text-ink-soft/30'>{'*'.repeat(5-r.rating)}</span></p>
                        <p className='text-xs text-ink-soft'>{r.reviewer?.name || 'Buyer'} - {new Date(r.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</p>
                    </div>
                    <p className='text-sm text-ink'>{r.comment}</p>
                </div>
            ))}
        </div>
    )
}

const Product=()=>{
    const {productId} = useParams();
    const navigate = useNavigate();
    const {products, addToCart, token} = useContext(ShopContext);
    const [productData, setProductData] = useState(false);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRefresh, setReviewRefresh] = useState(0);

    const fetchProductData=async()=>{
        products.map((item)=>{
            if (item._id===productId){
                setProductData(item);
                setImage(item.image[0]);
                return null;
            }
        })
    }
    useEffect(()=>{
        fetchProductData();
        window.scrollTo(0,0);
    },[productId,products])

    useEffect(() => {
        if (!productId) return;
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }, [productId]);

    return productData ? (
        <div className='border-t border-line pt-10 transition-opacity ease-in duration-500 opacity-100'>
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                        {
                            productData.image.map((item,index)=>(
                                <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                            ))
                        }
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img className='w-full h-auto' src={image} alt="" />
                    </div>
                </div>
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
                    <div className='flex items-center gap-1 mt-2 text-sm text-ink-soft'>
                        <p className='text-mustard'>{'*'.repeat(Math.round(productData.rating))}<span className='text-ink-soft/30'>{'*'.repeat(5-Math.round(productData.rating))}</span></p>
                        <p className='pl-2'>{productData.rating} ({productData.totalReviews} review{productData.totalReviews !== 1 ? 's' : ''})</p>
                    </div>
                    <p className='mt-5 text-3xl font-medium'>{formatINR(productData.price)}</p>
                    <p className='mt-5 text-ink-soft md:w-4/5'>{productData.description}</p>
                    <div className='mt-6 border border-line p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-xs text-ink-soft mb-1'>SOLD BY</p>
                            <p className='font-medium'>{productData.vendor}</p>
                            <p className='text-sm text-ink-soft'>{productData.location}</p>
                        </div>
                        <button onClick={()=>{ if(productData.vendorId) navigate(`/vendor/${productData.vendorId}`)}} className='text-sm border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors'>
                            View Shop
                        </button>
                    </div>
                    {productData.sizes && productData.sizes.length > 0 && (
                        <div className='flex flex-col gap-4 my-8'>
                            <p>Select Size</p>
                            <div className='flex gap-2'>
                                {productData.sizes.map((item,index)=>(
                                    <button onClick={()=>setSize(item)} className={`border py-2 px-4 ${item===size ? 'border-navy bg-navy text-paper' : 'border-line bg-paper'}`} key={index}>{item}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className='flex items-center gap-4 my-6'>
                        <p>Quantity</p>
                        <div className='flex items-center border border-line'>
                            <button onClick={()=>setQuantity(q=>Math.max(1,q-1))} className='px-3 py-1 hover:bg-line'>-</button>
                            <span className='px-4 py-1 min-w-[40px] text-center'>{quantity}</span>
                            <button onClick={()=>setQuantity(q=>Math.min(productData.stock,q+1))} className='px-3 py-1 hover:bg-line'>+</button>
                        </div>
                        <p className='text-sm text-ink-soft'>{productData.stock} in stock</p>
                    </div>
                    <button onClick={()=>addToCart(productData._id, size, quantity)} className='bg-ink text-paper px-8 py-3 text-sm hover:bg-navy transition-colors'>
                        ADD TO CART
                    </button>
                    <hr className='mt-8 sm:w-4/5 border-line'/>
                    <div className='text-sm text-ink-soft mt-5 flex flex-col gap-1'>
                        <p>- 100% Original product</p>
                        <p>- Cash on delivery available</p>
                        <p>- Easy 7-day returns and exchanges</p>
                    </div>
                </div>
            </div>
            <div className='mt-20'>
                <div className='flex'>
                    <b onClick={()=>setActiveTab('description')} className={`border border-line px-5 py-3 text-sm cursor-pointer ${activeTab==='description' ? 'bg-ink text-paper' : ''}`}>Description</b>
                    <p onClick={()=>setActiveTab('reviews')} className={`border border-line px-5 py-3 text-sm cursor-pointer ${activeTab==='reviews' ? 'bg-ink text-paper' : ''}`}>Reviews ({productData.totalReviews})</p>
                </div>
                <div className='flex flex-col gap-4 border border-line px-6 py-6 text-sm text-ink-soft'>
                    {activeTab==='description' ? (
                        <>
                            <p>{productData.description}</p>
                            <p>This product is made and shipped by {productData.vendor}, a verified seller from {productData.location}. Every product on VendorHub is quality-checked and authentic.</p>
                        </>
                    ) : (
                        <>
                            {token && !showReviewForm && (
                                <div className='mb-2'>
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className='border border-line text-sm font-medium px-4 py-2 hover:bg-ink hover:text-paper transition-colors'
                                    >
                                        Write a review
                                    </button>
                                    <p className='text-xs text-ink-soft mt-1'>Only available for verified purchases.</p>
                                </div>
                            )}
                            {showReviewForm && (
                                <ReviewForm
                                    productId={productData._id}
                                    productName={productData.name}
                                    onClose={() => { setShowReviewForm(false); setReviewRefresh(r => r + 1); }}
                                />
                            )}
                            <ReviewsList key={reviewRefresh} productId={productData._id}/>
                        </>
                    )}
                </div>
            </div>
            <RelatedProducts category={productData.category}/>
        </div>
    ):<div className='opacity-0'></div>
}

export default Product
