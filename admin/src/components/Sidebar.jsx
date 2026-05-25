import React from 'react'
import { NavLink } from 'react-router-dom'

const linkClass = ({isActive}) =>
    `flex items-center gap-3 border border-line border-r-0 px-3 py-2 rounded-l ${isActive ? 'bg-mustard text-ink' : ''}`

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2 border-line'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-ink-soft text-[15px]'>

            <NavLink to='/analytics' className={linkClass}>
                <p className='hidden md:block'>Analytics</p>
            </NavLink>

            <NavLink to='/vendor-approval' className={linkClass}>
                <p className='hidden md:block'>Vendor Approvals</p>
            </NavLink>

            <NavLink to='/refunds' className={linkClass}>
                <p className='hidden md:block'>Refunds</p>
            </NavLink>

            <NavLink to='/categories' className={linkClass}>
                <p className='hidden md:block'>Categories</p>
            </NavLink>

            <NavLink to='/commission' className={linkClass}>
                <p className='hidden md:block'>Commission</p>
            </NavLink>

        </div>
    </div>
  )
}

export default Sidebar