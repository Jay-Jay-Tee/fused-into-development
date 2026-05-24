import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const Profile = () => {

    const [shopName, setShopName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const fetchProfile = async () => {
        // Backend wiring later
        setShopName('Tantuja Studio');
        setDescription('Handwoven cotton products from Bengaluru. Family-run, three generations.');
        setLocation('Bengaluru');
        setPhone('9876543210');
        setEmail('hello@tantuja.in');
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        // Backend wiring later
        toast.success('Profile updated');
    }

    useEffect(()=>{
        fetchProfile();
    },[])

    return (
        <div>
            <h3 className='mb-6 font-medium'>Vendor Profile</h3>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 max-w-2xl'>

                <div>
                    <p className='mb-2 text-sm font-medium'>Shop name</p>
                    <input onChange={(e)=>setShopName(e.target.value)} value={shopName} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper' required/>
                </div>

                <div>
                    <p className='mb-2 text-sm font-medium'>Shop description</p>
                    <textarea onChange={(e)=>setDescription(e.target.value)} value={description} rows={4} className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper' required/>
                    <p className='text-xs text-ink-soft mt-1'>Buyers see this on your shop page. Keep it short and specific.</p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                        <p className='mb-2 text-sm font-medium'>City</p>
                        <input onChange={(e)=>setLocation(e.target.value)} value={location} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper' required/>
                    </div>
                    <div className='flex-1'>
                        <p className='mb-2 text-sm font-medium'>Phone</p>
                        <input onChange={(e)=>setPhone(e.target.value)} value={phone} type='tel' className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper' required/>
                    </div>
                </div>

                <div>
                    <p className='mb-2 text-sm font-medium'>Contact email</p>
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} type='email' className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper' required/>
                </div>

                <button type='submit' className='w-32 py-3 mt-4 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                    SAVE
                </button>
            </form>
        </div>
    )
}

export default Profile