import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { toPaise, toRupees } from '../utils/money'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Edit = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([null, null, null, null]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    axios.get(`${API}/products/${id}`),
                    axios.get(`${API}/categories`),
                ]);
                const product = productRes.data;
                setName(product.name || '');
                setDescription(product.description || '');
                setPrice(toRupees(product.price).toString());
                setStock(product.stock?.toString() || '');
                setExistingImages(product.images || []);
                const rootCats = categoriesRes.data.filter(c => !c.parentCategory);
                setCategories(rootCats);
                setCategoryId(product.category?._id || product.category || '');
            } catch (err) {
                toast.error('Failed to load product');
                navigate('/list');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Not authenticated');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', toPaise(Number(price)));
            formData.append('stock', stock);
            if (categoryId) formData.append('category', categoryId);
            existingImages.forEach(url => formData.append('existingImages', url));
            newImages.forEach(img => {
                if (img) formData.append('images', img);
            });
            await axios.put(`${API}/products/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Product updated');
            navigate('/list');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center py-20'>
                <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'></div>
            </div>
        );
    }

    const removeExisting = (i) => {
        setExistingImages(prev => prev.filter((_, idx) => idx !== i));
    };

    return (
        <form onSubmit={onSubmit} className='flex flex-col w-full items-start gap-3'>

            <div>
                <p className='mb-2 text-sm font-medium'>Images</p>
                {existingImages.length > 0 && (
                    <>
                        <p className='text-xs text-ink-soft mb-2'>Current images — click × to remove</p>
                        <div className='flex flex-wrap gap-2 mb-3'>
                            {existingImages.map((src, i) => (
                                <div key={i} className='relative w-20 h-20'>
                                    <img src={src} className='w-20 h-20 object-cover border border-line' alt=""/>
                                    <button
                                        type='button'
                                        onClick={() => removeExisting(i)}
                                        className='absolute top-0 right-0 bg-ink text-paper text-xs w-5 h-5 flex items-center justify-center leading-none hover:bg-red-600'
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <p className='text-xs text-ink-soft mb-2'>Add new images</p>
                <div className='flex gap-2'>
                    {newImages.map((img, i) => (
                        <label key={i} htmlFor={`newImage${i}`}>
                            <img className='w-20 cursor-pointer border border-line' src={img ? URL.createObjectURL(img) : assets.upload_area} alt=""/>
                            <input onChange={(e) => {
                                const updated = [...newImages];
                                updated[i] = e.target.files[0] || null;
                                setNewImages(updated);
                            }} type='file' id={`newImage${i}`} hidden/>
                        </label>
                    ))}
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' type='text' required/>
            </div>

            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' rows={3}/>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2 text-sm font-medium'>Category</p>
                    <select onChange={(e) => setCategoryId(e.target.value)} value={categoryId} className='w-full px-3 py-2 border border-line bg-paper outline-none focus:border-navy'>
                        <option value=''>Select category</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Price (₹)</p>
                    <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='0' min='0' required/>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Stock</p>
                    <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='0' min='0' required/>
                </div>
            </div>

            <div className='flex gap-3 mt-4'>
                <button type='submit' disabled={submitting} className='w-28 py-3 bg-ink text-paper text-sm hover:bg-navy transition-colors disabled:opacity-50'>
                    {submitting ? 'Saving...' : 'SAVE'}
                </button>
                <button type='button' onClick={() => navigate('/list')} className='w-28 py-3 border border-line text-sm hover:bg-line transition-colors'>
                    Cancel
                </button>
            </div>

        </form>
    )
}

export default Edit
