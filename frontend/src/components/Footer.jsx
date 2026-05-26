import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            <div>
                <img src={assets.logo} className='mb-5 w-32' alt="" />
                <p className='w-full md:w-2/3 text-ink-soft'>
                    VendorHub connects you with verified local vendors near you. Discover handcrafted goods, fresh stock, and fast delivery from your own city.
                </p>
            </div>
            <div>
                <p className='text-xl font-medium mb-5 text-ink'>COMPANY</p>
                <ul className='flex flex-col gap-1 text-ink-soft'>
                    <li><Link to='/' className='hover:text-ink'>Home</Link></li>
                    <li><Link to='/about' className='hover:text-ink'>About us</Link></li>
                    <li><Link to='/privacy-policy' className='hover:text-ink'>Privacy policy</Link></li>
                </ul>
            </div>
            <div>
                <p className='text-xl font-medium mb-5 text-ink'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-ink-soft'>
                    <li>+91 98765 43210</li>
                    <li><Link to='/contact' className='hover:text-ink'>Contact us</Link></li>
                </ul>
            </div>
        </div>
        <div>
            <hr className='border-line'/>
            <p className='py-5 text-sm text-center text-ink-soft'>Copyright 2026 @ VendorHub - All rights reserved.</p>
        </div>
    </div>
  )
}
export default Footer