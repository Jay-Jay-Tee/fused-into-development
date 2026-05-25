import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Navbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out');
        navigate('/register');
    }

    return (
        <div className='flex items-center py-2 px-[4%] justify-between'>
            <img src={assets.logo} className='w-[max(10%,80px)]' alt=""/>
            <button onClick={handleLogout} className='bg-ink text-paper px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-navy transition-colors'>
                Logout
            </button>
        </div>
    )
}

export default Navbar