import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Categories = () => {

    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [addingSubTo, setAddingSubTo] = useState(null);
    const [newSubCategory, setNewSubCategory] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API}/categories`);
            const all = res.data;
            const parents = all.filter(c => !c.parentCategory);
            const children = all.filter(c => c.parentCategory);
            const tree = parents.map(p => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                productCount: 0,
                subcategories: children
                    .filter(c => c.parentCategory?.toString() === p._id?.toString() || c.parentCategory === p._id)
                    .map(c => ({ _id: c._id, name: c.name, productCount: 0 })),
            }));
            setCategories(tree);
        } catch (err) {
            toast.error('Failed to load categories');
        }
    }

    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        const token = localStorage.getItem('token');
        const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
        try {
            const res = await axios.post(`${API}/admin/categories`, {
                name: newCategory.trim(),
                slug,
                isActive: true,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const created = res.data;
            setCategories(prev => [...prev, {
                _id: created._id,
                name: created.name,
                slug: created.slug,
                productCount: 0,
                subcategories: [],
            }]);
            setNewCategory('');
            toast.success('Category added');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add category');
        }
    }

    const deleteCategory = async (id) => {
        const cat = categories.find(c => c._id === id);
        if (cat.productCount > 0){
            toast.error(`Can't delete — ${cat.productCount} product(s) in this category`);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API}/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(prev => prev.filter(c => c._id !== id));
            toast.success('Category deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete category');
        }
    }

    const addSubCategory = async (e, parentId) => {
        e.preventDefault();
        if (!newSubCategory.trim()) return;
        const token = localStorage.getItem('token');
        const slug = newSubCategory.trim().toLowerCase().replace(/\s+/g, '-');
        try {
            const res = await axios.post(`${API}/admin/categories`, {
                name: newSubCategory.trim(),
                slug,
                parentCategory: parentId,
                isActive: true,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const created = res.data;
            setCategories(prev => prev.map(c =>
                c._id === parentId
                    ? { ...c, subcategories: [...c.subcategories, { _id: created._id, name: created.name, productCount: 0 }] }
                    : c
            ));
            setNewSubCategory('');
            setAddingSubTo(null);
            toast.success('Subcategory added');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add subcategory');
        }
    }

    const deleteSubCategory = async (parentId, subId) => {
        const cat = categories.find(c => c._id === parentId);
        if (!cat) return;
        const sub = cat.subcategories.find(s => s._id === subId);
        if (sub.productCount > 0){
            toast.error(`Can't delete — ${sub.productCount} product(s) in this subcategory`);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API}/admin/categories/${subId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(prev => prev.map(c =>
                c._id === parentId
                    ? { ...c, subcategories: c.subcategories.filter(s => s._id !== subId) }
                    : c
            ));
            toast.success('Subcategory deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete subcategory');
        }
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