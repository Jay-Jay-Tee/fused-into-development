import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { products } from '../assets/assets'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'

const List = () => {

    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const lowStockThreshold = 5;
    const fetchList = async () => {
        setList(products);
    }
    const removeProduct=async(id)=>{
        setList(prev=>prev.filter(item=>item._id!==id));
        toast.success('Product removed');
    }
    useEffect(()=>{
        fetchList();
    },[])
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
                        <img className='w-12' src={item.image[0]} alt=""/>
                        <p>{item.name}</p>
                        <p className='hidden md:block'>{item.category}</p>
                        <p className='hidden md:block'>{formatINR(item.price)}</p>
                        <div className='hidden md:flex items-center gap-2'>
                            <p>{item.stock}</p>
                            {item.stock <= lowStockThreshold && (
                                <span className='text-[10px] bg-brick text-paper px-1.5 py-0.5 rounded'>LOW</span>
                            )}
                        </div>
                        <div className='flex items-center justify-center gap-3'>
                            <p onClick={()=>navigate(`/edit/${item._id}`)} className='text-xs text-navy cursor-pointer hover:underline'>Edit</p>
                            <p onClick={()=>removeProduct(item._id)} className='cursor-pointer text-lg hover:text-brick transition-colors'>×</p>
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
    )
}

export default List