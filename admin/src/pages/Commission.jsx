import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const Commission = () => {

    const [defaultRate, setDefaultRate] = useState(10);
    const [savedDefault, setSavedDefault] = useState(10);
    const [categoryRates, setCategoryRates] = useState([]);

    const fetchCommission = async () => {
        // Backend wiring later
        setDefaultRate(10);
        setSavedDefault(10);
        setCategoryRates([
            { _id: 'cr001', category: 'Clothing', rate: 8 },
            { _id: 'cr002', category: 'Home', rate: 10 },
            { _id: 'cr003', category: 'Accessories', rate: 12 },
            { _id: 'cr004', category: 'Stationery', rate: 7 },
        ]);
    }

    const saveDefault = () => {
        if (defaultRate < 0 || defaultRate > 50){
            toast.error('Rate must be between 0 and 50');
            return;
        }
        // Backend wiring later
        setSavedDefault(defaultRate);
        toast.success('Default rate saved');
    }

    const updateCategoryRate = (id, newRate) => {
        setCategoryRates(prev => prev.map(c =>
            c._id === id ? {...c, rate: newRate} : c
        ));
    }

    const saveCategoryRate = (id) => {
        const cat = categoryRates.find(c => c._id === id);
        if (cat.rate < 0 || cat.rate > 50){
            toast.error('Rate must be between 0 and 50');
            return;
        }
        // Backend wiring later
        toast.success(`${cat.category} rate updated to ${cat.rate}%`);
    }

    useEffect(()=>{
        fetchCommission();
    },[])

    return (
        <div>
            <h3 className='mb-6 font-medium'>Commission Settings</h3>

            {/* Platform default */}
            <div className='border border-line bg-paper p-6 mb-8 max-w-2xl'>
                <p className='text-xs text-ink-soft tracking-wider mb-3'>PLATFORM DEFAULT</p>
                <p className='text-sm text-ink-soft mb-4'>
                    Applied to any product whose category does not have a custom rate below. Currently <span className='text-ink font-medium'>{savedDefault}%</span>.
                </p>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <input
                            type='number'
                            value={defaultRate}
                            onChange={(e)=>setDefaultRate(Number(e.target.value))}
                            min='0'
                            max='50'
                            step='0.5'
                            className='w-24 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm pr-7'
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft text-sm'>%</span>
                    </div>
                    <button onClick={saveDefault} disabled={defaultRate===savedDefault} className='px-5 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed'>
                        Save
                    </button>
                </div>
            </div>

            {/* Per-category rates */}
            <div className='border border-line bg-paper max-w-2xl'>
                <div className='p-4 border-b border-line'>
                    <p className='text-sm font-medium'>Per-category rates</p>
                    <p className='text-xs text-ink-soft mt-1'>Overrides the platform default for products in these categories.</p>
                </div>
                <div>
                    <div className='hidden md:grid grid-cols-[2fr_1fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                        <p>CATEGORY</p>
                        <p>RATE</p>
                        <p className='text-right'>ACTION</p>
                    </div>
                    {categoryRates.map((c) => (
                        <div key={c._id} className='grid grid-cols-[2fr_1fr_1fr] items-center py-3 px-4 text-sm border-b border-line last:border-b-0 gap-2'>
                            <p className='font-medium'>{c.category}</p>
                            <div className='relative'>
                                <input
                                    type='number'
                                    value={c.rate}
                                    onChange={(e)=>updateCategoryRate(c._id, Number(e.target.value))}
                                    min='0'
                                    max='50'
                                    step='0.5'
                                    className='w-20 px-2 py-1 border border-line outline-none focus:border-navy bg-paper text-sm pr-6'
                                />
                                <span className='absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft text-xs'>%</span>
                            </div>
                            <div className='text-right'>
                                <button onClick={()=>saveCategoryRate(c._id)} className='px-3 py-1 border border-line text-xs hover:bg-ink hover:text-paper transition-colors'>
                                    Save
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className='text-xs text-ink-soft mt-6 max-w-2xl'>
                <span className='text-ink font-medium'>Note:</span> Commission is deducted from each sale before payout. Rate changes apply to all future orders only, not past sales.
            </p>
        </div>
    )
}

export default Commission