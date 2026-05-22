import React from 'react'
import {assets} from '../assets/assets'
import { NavLink } from 'react-router-dom'
const Navbar = () => {
  return (
    <div className='flex items-center justify-between py-5 font-medium'>
        <img src={assets.logo} className='w-36' alt=""/>
        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink className='flex flex-col items-center gap-1'>
                <p>Home</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700'/>
            </NavLink>
        </ul>
    </div>
  )
}

export default Navbar