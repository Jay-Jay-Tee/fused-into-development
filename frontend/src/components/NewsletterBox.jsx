import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const NewsletterBox = () => {

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/newsletter`, { email: email || undefined, phone: phone || undefined });
            toast.success('Subscribed!');
            setEmail('');
            setPhone('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='text-center py-16'>
            <p className='text-2xl font-medium text-ink'>Subscribe now & get 20% off</p>
            <p className='text-ink-soft mt-3'>
                Sign up for early access to new drops, vendor stories, and weekly deals.
            </p>
            <form onSubmit={onSubmitHandler} className='w-full sm:w-2/3 mx-auto my-6 flex flex-col sm:flex-row gap-3'>
                <input
                    className='flex-1 outline-none bg-transparent py-3 px-3 border border-line'
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className='flex-1 outline-none bg-transparent py-3 px-3 border border-line'
                    type='tel'
                    placeholder='Phone number (optional)'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <button type='submit' disabled={loading} className='bg-ink text-paper text-xs px-8 py-4 font-medium hover:bg-navy transition-colors disabled:opacity-50'>
                    {loading ? '...' : 'SUBSCRIBE'}
                </button>
            </form>
        </div>
    )
}

export default NewsletterBox
