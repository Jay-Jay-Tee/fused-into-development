import React, { useContext, useEffect, useState, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { formatINR } from '../utils/money'
import VendorMap from '../components/VendorMap'

const Collection = () => {
    const {products, productsLoading, search, showSearch} = useContext(ShopContext);
    const [showFilter, setShowFilter] = useState(false);
    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [sortType, setSortType] = useState('relevant');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState(1000000);
    const [minRating, setMinRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState('grid');
    const productsPerPage = 8;

    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

    const toggleCategory=(e)=>{
        if (category.includes(e.target.value)){
            setCategory(prev=>prev.filter(item=>item!==e.target.value))
        } else{
            setCategory(prev => [...prev, e.target.value])
        }
    }


    const applyFilter=()=>{
        let productsCopy = products.slice();
        if (showSearch && search.trim() !== '') {
            const term = search.toLowerCase();
            productsCopy = productsCopy.filter(item =>
                `${item.name} ${item.vendor}`.toLowerCase().includes(term)
            );
        }
        if(category.length>0){
            productsCopy=productsCopy.filter(item=> category.includes(item.category));
        }
        productsCopy=productsCopy.filter(item=>item.price<=priceRange);
        productsCopy=productsCopy.filter(item=>(item.rating||0)>=minRating);
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
                setFilterProducts(fpCopy.sort((a,b)=>((b.averageRating||0)-(a.averageRating||0))));
                break;
            default:
                applyFilter();
                break;
        }
    }

    useEffect(()=>{
        applyFilter();
    },[category, priceRange, minRating, search, showSearch, products])
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
                        {uniqueCategories.map(cat => (
                            <p key={cat} className='flex gap-2'>
                                <input type='checkbox' className='w-3 accent-navy' value={cat} onChange={toggleCategory}/> {cat}
                            </p>
                        ))}
                        {uniqueCategories.length === 0 && <p className='text-xs'>Loading...</p>}
                    </div>
                </div>
                <div className={`border border-line pl-5 pr-3 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className='mb-3 text-sm font-medium'>MAX PRICE: {formatINR(priceRange)}</p>
                    <input type='range' min='10000' max='1000000' step='10000' value={priceRange} onChange={(e)=>setPriceRange(Number(e.target.value))} className='w-full accent-navy'/>
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
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                    <Title text1={'ALL'} text2={'COLLECTIONS'}/>
                    <div className='flex gap-3 items-center'>
                        <div className='flex border border-line'>
                            <button onClick={()=>setView('grid')} className={`px-3 py-1 text-xs transition-colors ${view==='grid' ? 'bg-ink text-paper' : 'hover:bg-line'}`}>
                                Grid
                            </button>
                            <button onClick={()=>setView('map')} className={`px-3 py-1 text-xs transition-colors ${view==='map' ? 'bg-ink text-paper' : 'hover:bg-line'}`}>
                                Map
                            </button>
                        </div>
                        <select onChange={(e)=>setSortType(e.target.value)} className='border border-line text-sm px-2'>
                            <option value="relevant">Sort by: Relevant</option>
                            <option value="low-high">Sort by: Low to High</option>
                            <option value="high-low">Sort by: High to Low</option>
                            <option value="rating">Sort by: Rating</option>
                        </select>
                    </div>
                </div>
                <p className='text-sm text-ink-soft mb-4'>
                    {view === 'map'
                        ? `${[...new Set(filterProducts.map(p=>p.vendorId).filter(Boolean))].length} vendor(s)`
                        : `Showing ${filterProducts.length===0 ? 0 : indexOfFirst+1}–${Math.min(indexOfLast,filterProducts.length)} of ${filterProducts.length} products`
                    }
                </p>

                {view === 'map' ? (
                    <VendorMap products={filterProducts}/>
                        ) : (
                            <>
                                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                                    {productsLoading
                                        ? [...Array(productsPerPage)].map((_, i) => <ProductCardSkeleton key={i} />)
                                        : currentProducts.map((item, index) => (
                                            <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} vendor={item.vendor} vendorId={item.vendorId}/>
                                        ))
                                    }
                                </div>
                                {!productsLoading && filterProducts.length===0 && (
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
                            </>
                        )}
            </div>
        </div>
    )
}

export default Collection