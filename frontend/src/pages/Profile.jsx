import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { toast } from 'react-toastify'

const STORAGE_KEY = 'vendorhub_addresses';

const Profile = () => {

    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        phone: '',
    });

    useEffect(()=>{
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setAddresses(JSON.parse(stored));
    },[])

    useEffect(()=>{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    },[addresses])

    const resetForm = () => {
        setFormData({
            label: '',
            firstName: '',
            lastName: '',
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: 'India',
            phone: '',
        });
        setEditingId(null);
        setShowForm(false);
    }

    const onChangeHandler = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (editingId){
            setAddresses(prev => prev.map(a => a.id === editingId ? {...formData, id: editingId} : a));
            toast.success('Address updated');
        } else {
            setAddresses(prev => [...prev, {...formData, id: `addr_${Date.now()}`}]);
            toast.success('Address saved');
        }
        resetForm();
    }

    const editAddress = (addr) => {
        setFormData(addr);
        setEditingId(addr.id);
        setShowForm(true);
    }

    const deleteAddress = (id) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
        toast.success('Address removed');
    }

    return (
        <div className='border-t border-line pt-14'>
            <div className='text-2xl mb-6'>
                <Title text1={'MY'} text2={'PROFILE'}/>
            </div>

            <div className='mb-12'>
                <div className='flex items-center justify-between mb-4'>
                    <p className='text-lg font-medium'>Saved Addresses</p>
                    {!showForm && (
                        <button onClick={()=>setShowForm(true)} className='text-sm border border-line px-4 py-2 hover:bg-ink hover:text-paper transition-colors'>
                            + Add address
                        </button>
                    )}
                </div>

                {/* Address list */}
                {addresses.length === 0 && !showForm && (
                    <div className='text-center py-12 border border-line bg-paper text-ink-soft text-sm'>
                        <p>No saved addresses. Add one to speed up checkout.</p>
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {addresses.map((addr) => (
                        <div key={addr.id} className='border border-line bg-paper p-5'>
                            <div className='flex items-start justify-between mb-3'>
                                <p className='text-xs font-medium tracking-wider bg-mustard text-ink px-2 py-1'>{addr.label || 'ADDRESS'}</p>
                                <div className='flex gap-3 text-xs'>
                                    <button onClick={()=>editAddress(addr)} className='text-ink-soft hover:text-ink'>Edit</button>
                                    <button onClick={()=>deleteAddress(addr.id)} className='text-ink-soft hover:text-brick'>Delete</button>
                                </div>
                            </div>
                            <p className='font-medium text-sm'>{addr.firstName} {addr.lastName}</p>
                            <p className='text-sm text-ink-soft mt-1'>{addr.street}</p>
                            <p className='text-sm text-ink-soft'>{addr.city}, {addr.state} {addr.zipcode}</p>
                            <p className='text-sm text-ink-soft'>{addr.country}</p>
                            <p className='text-sm text-ink-soft mt-2'>📞 {addr.phone}</p>
                        </div>
                    ))}
                </div>

                {/* Address form */}
                {showForm && (
                    <form onSubmit={onSubmitHandler} className='border border-line bg-paper p-6 mt-4'>
                        <p className='text-sm font-medium mb-4'>{editingId ? 'Edit address' : 'New address'}</p>
                        <div className='flex flex-col gap-3'>
                            <input required name='label' value={formData.label} onChange={onChangeHandler} type='text' placeholder='Label (e.g., Home, Work)' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            <div className='flex gap-3'>
                                <input required name='firstName' value={formData.firstName} onChange={onChangeHandler} type='text' placeholder='First name' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='lastName' value={formData.lastName} onChange={onChangeHandler} type='text' placeholder='Last name' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <input required name='street' value={formData.street} onChange={onChangeHandler} type='text' placeholder='Street address' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            <div className='flex gap-3'>
                                <input required name='city' value={formData.city} onChange={onChangeHandler} type='text' placeholder='City' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='state' value={formData.state} onChange={onChangeHandler} type='text' placeholder='State' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <div className='flex gap-3'>
                                <input required name='zipcode' value={formData.zipcode} onChange={onChangeHandler} type='text' pattern='[0-9]{6}' title='6-digit pincode' placeholder='Pincode' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='country' value={formData.country} onChange={onChangeHandler} type='text' placeholder='Country' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <input required name='phone' value={formData.phone} onChange={onChangeHandler} type='tel' pattern='[6-9][0-9]{9}' title='10-digit Indian mobile number' placeholder='Phone number' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                        </div>
                        <div className='flex gap-2 mt-5'>
                            <button type='submit' className='bg-ink text-paper px-6 py-2 text-sm hover:bg-navy transition-colors'>
                                {editingId ? 'Save changes' : 'Save address'}
                            </button>
                            <button type='button' onClick={resetForm} className='border border-line px-6 py-2 text-sm hover:bg-line transition-colors'>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Profile