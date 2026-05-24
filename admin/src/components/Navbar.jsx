import React from 'react'
import { assets } from '../assets/assets'

const Navbar = () => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <div className='flex items-center gap-3'>
            <img src={assets.logo} className='w-[max(10%,80px)]' alt=""/>
            <span className='text-xs bg-brick text-paper px-2 py-0.5 tracking-wider'>ADMIN</span>
        </div>
        <button className='bg-ink text-paper px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-navy transition-colors'>
            Logout
        </button>
    </div>
  )
}

export default Navbar