import React, {useState,useContext} from 'react'
import {assets} from '../assets/assets'
import {Link,NavLink,useNavigate,useLocation} from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
const Navbar=()=>{
    const [visible,setVisible]=useState(false);
    const {setShowSearch,getCartCount}=useContext(ShopContext);
    const navigate=useNavigate();
    const location=useLocation();
    const onCollection=location.pathname.includes('collection');
    return (
        <div className='flex items-center justify-between py-5 font-medium'>
            <img src={assets.logo} className='w-28' alt="" />
            <ul className='hidden sm:flex gap-5 text-sm text-ink-soft'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>HOME</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-navy hidden' />
                </NavLink>
                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>COLLECTION</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-navy hidden' />
                </NavLink>
                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>ABOUT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-navy hidden' />
                </NavLink>
                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>CONTACT</p>
                    <hr className='w-2/4 border-none h-[1.5px] bg-navy hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-6'>
                <img onClick={()=>{ if(!onCollection) navigate('/collection'); setShowSearch(true); }} src={assets.search_icon} className='w-5 cursor-pointer' alt=""/>
                <div className='group relative'>
                    <img onClick={()=>navigate('/login')} className='w-5 cursor-pointer' src={assets.profile_icon} alt="" />
                    <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                        <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-white border border-line text-ink-soft rounded'>
                            <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-ink'>My profile</p>
                            <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-ink'>Orders</p>
                            <p onClick={()=>navigate('/wishlist')} className='cursor-pointer hover:text-ink'>Wishlist</p>
                            <p className='cursor-pointer hover:text-ink'>Logout</p>
                        </div>
                    </div>
                </div>
                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-brick text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
                </Link>
                <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
            </div>
            {/* Sidebar menu for small screens */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-ink-soft'>
                    <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt=""/>
                        <p>Back</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border border-line' to='/'>HOME</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border border-line' to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border border-line' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border border-line' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    )
}
export default Navbar