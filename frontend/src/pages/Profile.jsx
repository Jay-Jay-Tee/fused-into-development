import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { toast } from 'react-toastify'
import api from '../api/axiosInstance'

const emptyForm = {
    label: '', firstName: '', lastName: '',
    street: '', city: '', state: '', pincode: '', country: 'India', phone: '',
};

const Profile = () => {
    const [addresses, setAddresses]   = useState([]);
    const [showForm, setShowForm]     = useState(false);
    const [editingIdx, setEditingIdx] = useState(null); // null = new, number = editing index
    const [formData, setFormData]     = useState(emptyForm);
    const [loading, setLoading]       = useState(true);

    const fetchAddresses = () => {
        api.get('/users/me')
            .then(res => setAddresses(res.data.user?.addresses || []))
            .catch(() => toast.error('Could not load profile'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAddresses(); }, []);

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingIdx(null);
        setShowForm(false);
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const payload = {
            firstName: formData.firstName, lastName: formData.lastName,
            street: formData.street, city: formData.city, state: formData.state,
            pincode: formData.pincode, country: formData.country, phone: formData.phone,
        };
        try {
            if (editingIdx !== null) {
                await api.put(`/users/me/addresses/${editingIdx}`, payload);
                toast.success('Address updated');
            } else {
                await api.post('/users/me/addresses', payload);
                toast.success('Address saved');
            }
            fetchAddresses();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not save address');
        }
    };

    const editAddress = (addr, idx) => {
        setFormData({
            label: addr.label || '',
            firstName: addr.firstName, lastName: addr.lastName,
            street: addr.street, city: addr.city, state: addr.state,
            pincode: addr.pincode, country: addr.country, phone: addr.phone,
        });
        setEditingIdx(idx);
        setShowForm(true);
    };

    const deleteAddress = async (idx) => {
        try {
            await api.delete(`/users/me/addresses/${idx}`);
            toast.success('Address removed');
            fetchAddresses();
        } catch {
            toast.error('Could not remove address');
        }
    };

    if (loading) {
        return (
            <div className='border-t border-line pt-14 text-center py-20 text-ink-soft'>
                <p>Loading profile...</p>
            </div>
        );
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
                        <button onClick={() => setShowForm(true)} className='text-sm border border-line px-4 py-2 hover:bg-ink hover:text-paper transition-colors'>
                            + Add address
                        </button>
                    )}
                </div>

                {addresses.length === 0 && !showForm && (
                    <div className='text-center py-12 border border-line bg-paper text-ink-soft text-sm'>
                        <p>No saved addresses. Add one to speed up checkout.</p>
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {addresses.map((addr, idx) => (
                        <div key={idx} className='border border-line bg-paper p-5'>
                            <div className='flex items-start justify-between mb-3'>
                                <p className='text-xs font-medium tracking-wider bg-mustard text-ink px-2 py-1'>ADDRESS {idx + 1}</p>
                                <div className='flex gap-3 text-xs'>
                                    <button onClick={() => editAddress(addr, idx)} className='text-ink-soft hover:text-ink'>Edit</button>
                                    <button onClick={() => deleteAddress(idx)} className='text-ink-soft hover:text-brick'>Delete</button>
                                </div>
                            </div>
                            <p className='font-medium text-sm'>{addr.firstName} {addr.lastName}</p>
                            <p className='text-sm text-ink-soft mt-1'>{addr.street}</p>
                            <p className='text-sm text-ink-soft'>{addr.city}, {addr.state} {addr.pincode}</p>
                            <p className='text-sm text-ink-soft'>{addr.country}</p>
                            <p className='text-sm text-ink-soft mt-2'>📞 {addr.phone}</p>
                        </div>
                    ))}
                </div>

                {showForm && (
                    <form onSubmit={onSubmitHandler} className='border border-line bg-paper p-6 mt-4'>
                        <p className='text-sm font-medium mb-4'>{editingIdx !== null ? 'Edit address' : 'New address'}</p>
                        <div className='flex flex-col gap-3'>
                            <div className='flex gap-3'>
                                <input required name='firstName' value={formData.firstName} onChange={onChangeHandler} type='text' placeholder='First name' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='lastName'  value={formData.lastName}  onChange={onChangeHandler} type='text' placeholder='Last name'  className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <input required name='street'  value={formData.street}  onChange={onChangeHandler} type='text' placeholder='Street address' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            <div className='flex gap-3'>
                                <input required name='city'  value={formData.city}  onChange={onChangeHandler} type='text' placeholder='City'  className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='state' value={formData.state} onChange={onChangeHandler} type='text' placeholder='State' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <div className='flex gap-3'>
                                <input required name='pincode' value={formData.pincode} onChange={onChangeHandler} type='text' pattern='[0-9]{6}' title='6-digit pincode' placeholder='Pincode' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                                <input required name='country' value={formData.country} onChange={onChangeHandler} type='text' placeholder='Country' className='flex-1 px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                            </div>
                            <input required name='phone' value={formData.phone} onChange={onChangeHandler} type='tel' pattern='[6-9][0-9]{9}' title='10-digit Indian mobile number' placeholder='Phone number' className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'/>
                        </div>
                        <div className='flex gap-2 mt-5'>
                            <button type='submit' className='bg-ink text-paper px-6 py-2 text-sm hover:bg-navy transition-colors'>
                                {editingIdx !== null ? 'Save changes' : 'Save address'}
                            </button>
                            <button type='button' onClick={resetForm} className='border border-line px-6 py-2 text-sm hover:bg-line transition-colors'>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile
