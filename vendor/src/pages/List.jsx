import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const List = () => {

    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const lowStockThreshold = 5;

    const fetchList = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/products/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setList(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setList(prev => prev.filter(item => item._id !== id));
            toast.success('Product removed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove product');
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center py-20'>
                <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'/>
            </div>
        );
    }

    return (
        <>
            <p className='mb-2 font-medium'>All products list</p>
            <div className='flex flex-col gap-2'>
                <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border border-line bg-paper text-sm font-medium text-ink-soft'>
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b>Stock</b>
                    <b className='text-center'>Action</b>
                </div>
                {list.map((item) => (
                    <div key={item._id} className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-line text-sm'>
                        <img className='w-12' src={item.images?.[0]} alt=""/>
                        <p>{item.name}</p>
                        <p className='hidden md:block'>{item.category?.name || item.category}</p>
                        <p className='hidden md:block'>{formatINR(item.price)}</p>
                        <div className='hidden md:flex items-center gap-2'>
                            <p>{item.stock}</p>
                            {item.stock <= lowStockThreshold && (
                                <span className='text-[10px] bg-brick text-paper px-1.5 py-0.5 rounded'>LOW</span>
                            )}
                        </div>
                        <div className='flex items-center justify-center gap-3'>
                            <p onClick={() => navigate(`/edit/${item._id}`)} className='text-xs text-navy cursor-pointer hover:underline'>Edit</p>
                            <p onClick={() => removeProduct(item._id)} className='cursor-pointer text-lg hover:text-brick transition-colors'>x</p>
                        </div>
                    </div>
                ))}
                {list.length === 0 && (
                    <div className='text-center py-12 text-ink-soft text-sm'>
                        <p>You haven't listed any products yet.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default List
