import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const Collection = () => {
    const {products, search, showSearch} = useContext(ShopContext);
    const [showFilter, setShowFilter] = useState(false);
    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState('relevant');
    const toggleCategory=(e)=>{
        if (category.includes(e.target.value)){
            setCategory(prev=>prev.filter(item=>item!==e.target.value))
        } else{
            setCategory(prev => [...prev, e.target.value])
        }
    }
    const toggleSubCategory=(e)=>{
        if (subCategory.includes(e.target.value)){
            setSubCategory(prev=>prev.filter(item=>item!==e.target.value))
        }else {
            setSubCategory(prev=>[...prev,e.target.value])
        }
    }
    const applyFilter=()=>{
        let productsCopy = products.slice();
        if (showSearch&&search){
            productsCopy=productsCopy.filter(item=>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.vendor.toLowerCase().includes(search.toLowerCase()) ||
                item.location.toLowerCase().includes(search.toLowerCase())
            )
        }
        if(category.length>0){
            productsCopy=productsCopy.filter(item=> category.includes(item.category));
        }
        if (subCategory.length>0){
            productsCopy=productsCopy.filter(item=>subCategory.includes(item.subCategory));
        }
        setFilterProducts(productsCopy);
    }
    const sortProduct=()=>{
        let fpCopy=filterProducts.slice();
        switch (sortType){
            case 'low-high':
                setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
                break;
            case 'high-low':
                setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
                break;
            default:
                applyFilter();
                break;
        }
    }

    useEffect(()=>{
        applyFilter();
    },[category, subCategory, search, showSearch, products])
    useEffect(()=>{
        sortProduct();
    },[sortType])
    return (
        <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-line'>
            <div className='min-w-60'>
                <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 font-medium'>
                    FILTERS
                    <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
                </p>
                <div className={`border border-line pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
                    <div className='flex flex-col gap-2 text-sm font-light text-ink-soft'>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Clothing'} onChange={toggleCategory}/> Clothing</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Home'} onChange={toggleCategory}/> Home</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Accessories'} onChange={toggleCategory}/> Accessories</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Stationery'} onChange={toggleCategory}/> Stationery</p>
                    </div>
                </div>
                <div className={`border border-line pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>TYPE</p>
                    <div className='flex flex-col gap-2 text-sm font-light text-ink-soft'>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Topwear'} onChange={toggleSubCategory}/> Topwear</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Lighting'} onChange={toggleSubCategory}/> Lighting</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Kitchen'} onChange={toggleSubCategory}/> Kitchen</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Furniture'} onChange={toggleSubCategory}/> Furniture</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Wallets'} onChange={toggleSubCategory}/> Wallets</p>
                        <p className='flex gap-2'><input type='checkbox' className='w-3 accent-navy' value={'Bags'} onChange={toggleSubCategory}/> Bags</p>
                    </div>
                </div>
            </div>
            <div className='flex-1'>
                <div className='flex justify-between text-base sm:text-2xl mb-4'>
                    <Title text1={'ALL'} text2={'COLLECTIONS'}/>
                    <select onChange={(e)=>setSortType(e.target.value)} className='border border-line text-sm px-2'>
                        <option value="relevant">Sort by: Relevant</option>
                        <option value="low-high">Sort by: Low to High</option>
                        <option value="high-low">Sort by: High to Low</option>
                    </select>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                    {
                        filterProducts.map((item,index)=>(
                            <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} location={item.location}/>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Collection