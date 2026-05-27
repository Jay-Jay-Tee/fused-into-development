import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Profile = () => {

    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/vendors/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStoreName(res.data.storeName || '');
            setStoreDescription(res.data.storeDescription || '');
            setPhone(res.data.phone || '');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('storeName', storeName);
            formData.append('storeDescription', storeDescription);
            formData.append('phone', phone);
            await axios.put(`${API}/vendors/me`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center py-20'>
                <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'/>
            </div>
        );
    }

    return (
        <div>
            <h3 className='mb-6 font-medium'>Vendor Profile</h3>
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 max-w-2xl'>
                <div>
                    <p className='mb-2 text-sm font-medium'>Shop name</p>
                    <input
                        onChange={(e) => setStoreName(e.target.value)}
                        value={storeName}
                        type='text'
                        className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper'
                        required
                    />
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Shop description</p>
                    <textarea
                        onChange={(e) => setStoreDescription(e.target.value)}
                        value={storeDescription}
                        rows={4}
                        className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper'
                        required
                    />
                    <p className='text-xs text-ink-soft mt-1'>Buyers see this on your shop page. Keep it short and specific.</p>
                </div>
                <div>
                    <p className='mb-2 text-sm font-medium'>Phone</p>
                    <input
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}
                        type='tel'
                        pattern='[6-9][0-9]{9}'
                        title='10-digit Indian mobile number'
                        className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper'
                        required
                    />
                </div>
                <button
                    type='submit'
                    disabled={submitting}
                    className='w-32 py-3 mt-4 bg-ink text-paper text-sm hover:bg-navy transition-colors disabled:opacity-50'
                >
                    {submitting ? 'Saving...' : 'SAVE'}
                </button>
            </form>
        </div>
    );
};

export default Profile
