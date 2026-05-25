import React from 'react'
import { NavLink } from 'react-router-dom'

const linkClass = ({isActive}) =>
    `flex items-center gap-3 border border-line border-r-0 px-3 py-2 rounded-l ${isActive ? 'bg-mustard text-ink' : ''}`

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-line'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-ink-soft text-[15px]'>

            <NavLink to='/add' className={linkClass}>
                <p className='hidden md:block'>Add Items</p>
            </NavLink>

            <NavLink to='/list' className={linkClass}>
                <p className='hidden md:block'>List Items</p>
            </NavLink>

            <NavLink to='/orders' className={linkClass}>
                <p className='hidden md:block'>Orders</p>
            </NavLink>

            <NavLink to='/earnings' className={linkClass}>
                <p className='hidden md:block'>Earnings</p>
            </NavLink>

            <NavLink to='/payouts' className={linkClass}>
                <p className='hidden md:block'>Payouts</p>
            </NavLink>

            <NavLink to='/profile' className={linkClass}>
                <p className='hidden md:block'>Profile</p>
            </NavLink>

        </div>
    </div>
  )
}

export default Sidebar