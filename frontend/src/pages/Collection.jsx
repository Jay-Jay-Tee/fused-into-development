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
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState(10000);
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;
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
        if (location.trim()!==''){
            productsCopy=productsCopy.filter(item=>item.location.toLowerCase().includes(location.toLowerCase()));
        }
        productsCopy=productsCopy.filter(item=>item.price<=priceRange);
        productsCopy=productsCopy.filter(item=>item.rating>=minRating);
        setFilterProducts(productsCopy);
        setCurrentPage(1);
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
            case 'rating':
                setFilterProducts(fpCopy.sort((a,b)=>(b.rating-a.rating)));
                break;
            default:
                applyFilter();
                break;
        }
    }

    useEffect(()=>{
        applyFilter();
    },[category, subCategory, location, priceRange, minRating, search, showSearch, products])
    useEffect(()=>{
        sortProduct();
    },[sortType])

    const indexOfLast=currentPage*productsPerPage;
    const indexOfFirst=indexOfLast-productsPerPage;
    const currentProducts=filterProducts.slice(indexOfFirst,indexOfLast);
    const totalPages=Math.ceil(filterProducts.length/productsPerPage);

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
                <div className={`border border-line pl-5 pr-3 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>LOCATION</p>
                    <input type='text' value={location} onChange={(e)=>setLocation(e.target.value)} placeholder='Search by city...' className='w-full text-sm border border-line px-2 py-1 outline-none focus:border-navy'/>
                </div>
                <div className={`border border-line pl-5 pr-3 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>MAX PRICE: ₹{priceRange}</p>
                    <input type='range' min='100' max='10000' step='100' value={priceRange} onChange={(e)=>setPriceRange(Number(e.target.value))} className='w-full accent-navy'/>
                </div>
                <div className={`border border-line pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>MIN RATING</p>
                    <div className='flex flex-col gap-2 text-sm font-light text-ink-soft'>
                        {[4.5,4,3.5,0].map((r,i)=>(
                            <p key={i} className='flex gap-2 cursor-pointer' onClick={()=>setMinRating(r)}>
                                <input type='radio' name='rating' checked={minRating===r} readOnly className='w-3 accent-navy'/>
                                {r===0 ? 'All ratings' : `${r}+ stars`}
                            </p>
                        ))}
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
                        <option value="rating">Sort by: Rating</option>
                    </select>
                </div>
                <p className='text-sm text-ink-soft mb-4'>
                    Showing {filterProducts.length===0 ? 0 : indexOfFirst+1}-{Math.min(indexOfLast,filterProducts.length)} of {filterProducts.length} products
                </p>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                    {
                        currentProducts.map((item,index)=>(
                            <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} location={item.location}/>
                        ))
                    }
                </div>
                {filterProducts.length===0 && (
                    <div className='text-center py-20 text-ink-soft'>
                        <p>No products match your filters.</p>
                    </div>
                )}
                {totalPages>1 && (
                    <div className='flex justify-center items-center gap-2 mt-12'>
                        <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className='px-4 py-2 border border-line text-sm disabled:opacity-40 hover:bg-ink hover:text-paper transition-colors'>Prev</button>
                        {[...new Array(totalPages)].map((_,i)=>(
                            <button key={i} onClick={()=>setCurrentPage(i+1)} className={`w-9 h-9 text-sm border border-line ${currentPage===i+1 ? 'bg-ink text-paper' : 'hover:bg-line'}`}>{i+1}</button>
                        ))}
                        <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className='px-4 py-2 border border-line text-sm disabled:opacity-40 hover:bg-ink hover:text-paper transition-colors'>Next</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Collection