import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import { toPaise } from '../utils/money'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Add = () => {

    const [image1, setImage1] = useState(false);
    const [image2, setImage2] = useState(false);
    const [image3, setImage3] = useState(false);
    const [image4, setImage4] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stock, setStock] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/categories`)
            .then(res => {
                setCategories(res.data);
                if (res.data.length > 0) setCategoryId(res.data[0]._id);
            })
            .catch(() => toast.error('Could not load categories'));
    }, []);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image1) {
            toast.error('Upload at least one image');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Not authenticated');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', toPaise(Number(price)));
            formData.append('stock', Number(stock));
            formData.append('category', categoryId);
            if (image1) formData.append('images', image1);
            if (image2) formData.append('images', image2);
            if (image3) formData.append('images', image3);
            if (image4) formData.append('images', image4);

            await axios.post(`${API}/products`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Product added');
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setImage1(false);
            setImage2(false);
            setImage3(false);
            setImage4(false);
            if (categories.length > 0) setCategoryId(categories[0]._id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>

            <div>
                <p className='mb-2 text-sm font-medium'>Upload Images</p>
                <div className='flex gap-2'>
                    <label htmlFor='image1'>
                        <img className='w-20 cursor-pointer border border-line' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt=""/>
                        <input onChange={(e) => setImage1(e.target.files[0])} type='file' id='image1' hidden/>
                    </label>
                    <label htmlFor='image2'>
                        <img className='w-20 cursor-pointer border border-line' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt=""/>
                        <input onChange={(e) => setImage2(e.target.files[0])} type='file' id='image2' hidden/>
                    </label>
                    <label htmlFor='image3'>
                        <img className='w-20 cursor-pointer border border-line' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt=""/>
                        <input onChange={(e) => setImage3(e.target.files[0])} type='file' id='image3' hidden/>
                    </label>
                    <label htmlFor='image4'>
                        <img className='w-20 cursor-pointer border border-line' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt=""/>
                        <input onChange={(e) => setImage4(e.target.files[0])} type='file' id='image4' hidden/>
                    </label>
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' type='text' placeholder='Type here' required/>
            </div>

            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product description</p>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' placeholder='Write content here' required/>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2 text-sm font-medium'>Category</p>
                    <select onChange={(e) => setCategoryId(e.target.value)} value={categoryId} className='w-full px-3 py-2 border border-line bg-paper outline-none focus:border-navy'>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Price (₹)</p>
                    <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='500' min='1' required/>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Stock</p>
                    <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='10' min='0' required/>
                </div>
            </div>

            <button type='submit' disabled={loading} className='w-28 py-3 mt-4 bg-ink text-paper text-sm hover:bg-navy transition-colors disabled:opacity-50'>
                {loading ? 'Adding...' : 'ADD'}
            </button>
        </form>
    );
};

export default Add
