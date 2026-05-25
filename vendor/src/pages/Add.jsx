import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import { toPaise } from '../utils/money'

const CATEGORY_TREE = {
    Clothing: ['Topwear', 'Accessories'],
    Home: ['Lighting', 'Kitchen', 'Furniture', 'Garden'],
    Accessories: ['Wallets', 'Bags'],
    Stationery: ['Journals'],
};

const CATEGORIES = Object.keys(CATEGORY_TREE);

const Add = () => {

    const [image1, setImage1] = useState(false);
    const [image2, setImage2] = useState(false);
    const [image3, setImage3] = useState(false);
    const [image4, setImage4] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Clothing');
    const [subCategory, setSubCategory] = useState('Topwear');
    const [stock, setStock] = useState('');
    const [location, setLocation] = useState('');
    const [bestseller, setBestseller] = useState(false);
    const [sizes, setSizes] = useState([]);

    useEffect(()=>{
        const validSubs = CATEGORY_TREE[category];
        if (!validSubs.includes(subCategory)){
            setSubCategory(validSubs[0]);
        }
    },[category])

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image1){
            toast.error('Upload at least one image');
            return;
        }
        const priceInPaise = toPaise(Number(price));
        const payload = {
            name,
            description,
            price: priceInPaise,
            category,
            subCategory,
            stock: Number(stock),
            location,
            sizes,
            bestseller,
        };
        console.log('Submitting product:', payload);
        toast.success('Product added');
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setLocation('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setSizes([]);
        setBestseller(false);
        setCategory('Clothing');
        setSubCategory('Topwear');
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>

            <div>
                <p className='mb-2 text-sm font-medium'>Upload Images</p>
                <div className='flex gap-2'>
                    <label htmlFor='image1'>
                        <img className='w-20 cursor-pointer border border-line' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt=""/>
                        <input onChange={(e)=>setImage1(e.target.files[0])} type='file' id='image1' hidden/>
                    </label>
                    <label htmlFor='image2'>
                        <img className='w-20 cursor-pointer border border-line' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt=""/>
                        <input onChange={(e)=>setImage2(e.target.files[0])} type='file' id='image2' hidden/>
                    </label>
                    <label htmlFor='image3'>
                        <img className='w-20 cursor-pointer border border-line' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt=""/>
                        <input onChange={(e)=>setImage3(e.target.files[0])} type='file' id='image3' hidden/>
                    </label>
                    <label htmlFor='image4'>
                        <img className='w-20 cursor-pointer border border-line' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt=""/>
                        <input onChange={(e)=>setImage4(e.target.files[0])} type='file' id='image4' hidden/>
                    </label>
                </div>
            </div>
            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product name</p>
                <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' type='text' placeholder='Type here' required/>
            </div>
            <div className='w-full'>
                <p className='mb-2 text-sm font-medium'>Product description</p>
                <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border border-line outline-none focus:border-navy bg-paper' placeholder='Write content here' required></textarea>
            </div>
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2 text-sm font-medium'>Category</p>
                    <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-3 py-2 border border-line bg-paper outline-none focus:border-navy'>
                        {CATEGORIES.map((c)=>(
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Sub category</p>
                    <select onChange={(e)=>setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2 border border-line bg-paper outline-none focus:border-navy'>
                        {CATEGORY_TREE[category].map((s)=>(
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Price</p>
                    <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='₹500' required/>
                    {name && category && (
                        <p className='text-xs text-ink-soft mt-1 italic'>
                            AI suggestion will appear here once backend is wired.
                        </p>
                    )}
                </div>
            </div>
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2 text-sm font-medium'>Stock</p>
                    <input onChange={(e)=>setStock(e.target.value)} value={stock} className='w-full px-3 py-2 sm:w-[120px] border border-line outline-none focus:border-navy bg-paper' type='number' placeholder='10' required/>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Vendor location</p>
                    <input onChange={(e)=>setLocation(e.target.value)} value={location} className='w-full px-3 py-2 sm:w-[200px] border border-line outline-none focus:border-navy bg-paper' type='text' placeholder='e.g., Bengaluru' required/>
                </div>
            </div>
            <div>
                <p className='mb-2 text-sm font-medium'>Available sizes (optional)</p>
                <div className='flex gap-3'>
                    {['S','M','L','XL','XXL'].map((s)=>(
                        <p key={s} onClick={()=>setSizes(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s])} className={`px-3 py-1 cursor-pointer border ${sizes.includes(s) ? 'bg-mustard border-mustard text-ink' : 'border-line bg-paper text-ink-soft'}`}>
                            {s}
                        </p>
                    ))}
                </div>
            </div>
            <div className='flex gap-2 mt-2'>
                <input onChange={()=>setBestseller(prev=>!prev)} checked={bestseller} type='checkbox' id='bestseller' className='accent-navy'/>
                <label className='cursor-pointer text-sm' htmlFor='bestseller'>Add to bestseller</label>
            </div>
            <button type='submit' className='w-28 py-3 mt-4 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                ADD
            </button>
        </form>
    )
}

export default Add