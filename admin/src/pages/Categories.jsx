import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const Categories = () => {

    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [addingSubTo, setAddingSubTo] = useState(null);
    const [newSubCategory, setNewSubCategory] = useState('');

    const fetchCategories = async () => {
        // Backend wiring later
        const mockCategories = [
            {
                _id: 'c001',
                name: 'Clothing',
                slug: 'clothing',
                productCount: 4,
                subcategories: [
                    { _id: 'sc001', name: 'Topwear', productCount: 3 },
                    { _id: 'sc002', name: 'Accessories', productCount: 1 },
                ]
            },
            {
                _id: 'c002',
                name: 'Home',
                slug: 'home',
                productCount: 5,
                subcategories: [
                    { _id: 'sc003', name: 'Lighting', productCount: 1 },
                    { _id: 'sc004', name: 'Kitchen', productCount: 2 },
                    { _id: 'sc005', name: 'Furniture', productCount: 1 },
                    { _id: 'sc006', name: 'Garden', productCount: 1 },
                ]
            },
            {
                _id: 'c003',
                name: 'Accessories',
                slug: 'accessories',
                productCount: 2,
                subcategories: [
                    { _id: 'sc007', name: 'Wallets', productCount: 1 },
                    { _id: 'sc008', name: 'Bags', productCount: 1 },
                ]
            },
            {
                _id: 'c004',
                name: 'Stationery',
                slug: 'stationery',
                productCount: 1,
                subcategories: [
                    { _id: 'sc009', name: 'Journals', productCount: 1 },
                ]
            },
        ];
        setCategories(mockCategories);
    }

    const addCategory = (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        // Backend wiring later
        const newCat = {
            _id: `c_new_${Date.now()}`,
            name: newCategory.trim(),
            slug: newCategory.trim().toLowerCase().replace(/\s+/g, '-'),
            productCount: 0,
            subcategories: [],
        };
        setCategories(prev => [...prev, newCat]);
        setNewCategory('');
        toast.success('Category added');
    }

    const deleteCategory = (id) => {
        const cat = categories.find(c => c._id === id);
        if (cat.productCount > 0){
            toast.error(`Can't delete — ${cat.productCount} product(s) in this category`);
            return;
        }
        // Backend wiring later
        setCategories(prev => prev.filter(c => c._id !== id));
        toast.success('Category deleted');
    }

    const addSubCategory = (e, parentId) => {
        e.preventDefault();
        if (!newSubCategory.trim()) return;
        // Backend wiring later
        setCategories(prev => prev.map(c =>
            c._id === parentId
                ? { ...c, subcategories: [...c.subcategories, { _id: `sc_new_${Date.now()}`, name: newSubCategory.trim(), productCount: 0 }] }
                : c
        ));
        setNewSubCategory('');
        setAddingSubTo(null);
        toast.success('Subcategory added');
    }

    const deleteSubCategory = (parentId, subId) => {
        const cat = categories.find(c => c._id === parentId);
        const sub = cat.subcategories.find(s => s._id === subId);
        if (sub.productCount > 0){
            toast.error(`Can't delete — ${sub.productCount} product(s) in this subcategory`);
            return;
        }
        setCategories(prev => prev.map(c =>
            c._id === parentId
                ? { ...c, subcategories: c.subcategories.filter(s => s._id !== subId) }
                : c
        ));
        toast.success('Subcategory deleted');
    }

    useEffect(()=>{
        fetchCategories();
    },[])

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>Categories</h3>
                <p className='text-sm text-ink-soft'>{categories.length} categories</p>
            </div>

            {/* Add new category */}
            <form onSubmit={addCategory} className='flex gap-2 mb-8 max-w-md'>
                <input
                    value={newCategory}
                    onChange={(e)=>setNewCategory(e.target.value)}
                    type='text'
                    placeholder='New category name'
                    className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                />
                <button type='submit' className='px-5 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                    Add
                </button>
            </form>

            {/* Category list */}
            <div className='flex flex-col gap-3'>
                {categories.map((cat) => (
                    <div key={cat._id} className='border border-line bg-paper'>

                        {/* Category header */}
                        <div className='flex items-center justify-between p-4 border-b border-line'>
                            <div>
                                <p className='font-medium'>{cat.name}</p>
                                <p className='text-xs text-ink-soft mt-1'>/{cat.slug} · {cat.productCount} products</p>
                            </div>
                            <button onClick={()=>deleteCategory(cat._id)} className='text-lg cursor-pointer hover:text-brick transition-colors'>×</button>
                        </div>

                        {/* Subcategories */}
                        <div className='p-4'>
                            <div className='flex flex-wrap gap-2 mb-3'>
                                {cat.subcategories.map((sub) => (
                                    <div key={sub._id} className='flex items-center gap-2 border border-line px-3 py-1 text-sm bg-paper'>
                                        <span>{sub.name}</span>
                                        <span className='text-xs text-ink-soft'>({sub.productCount})</span>
                                        <button onClick={()=>deleteSubCategory(cat._id, sub._id)} className='text-ink-soft hover:text-brick'>×</button>
                                    </div>
                                ))}
                            </div>

                            {/* Add subcategory inline */}
                            {addingSubTo === cat._id ? (
                                <form onSubmit={(e)=>addSubCategory(e, cat._id)} className='flex gap-2'>
                                    <input
                                        value={newSubCategory}
                                        onChange={(e)=>setNewSubCategory(e.target.value)}
                                        type='text'
                                        placeholder='Subcategory name'
                                        autoFocus
                                        className='flex-1 max-w-xs px-2 py-1 border border-line outline-none focus:border-navy bg-paper text-sm'
                                    />
                                    <button type='submit' className='px-3 py-1 bg-ink text-paper text-xs hover:bg-navy transition-colors'>Add</button>
                                    <button type='button' onClick={()=>{setAddingSubTo(null); setNewSubCategory('')}} className='px-3 py-1 border border-line text-xs hover:bg-line transition-colors'>Cancel</button>
                                </form>
                            ) : (
                                <button onClick={()=>setAddingSubTo(cat._id)} className='text-xs text-ink-soft hover:text-ink underline'>
                                    + Add subcategory
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className='text-center py-20 text-ink-soft'>
                        <p>No categories yet. Add one above to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories