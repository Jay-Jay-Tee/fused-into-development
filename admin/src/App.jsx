import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import VendorApproval from './pages/VendorApproval'
import RefundQueue from './pages/RefundQueue'
import Categories from './pages/Categories'
import Commission from './pages/Commission'
import Analytics from './pages/Analytics'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotFound from './pages/NotFound'
import Login from './pages/Login'


const App = () => {
  const location = useLocation();
  const isBareLayout = location.pathname === '/login';

  return (
    <div className='bg-paper min-h-screen'>
      <ToastContainer/>
      {!isBareLayout && <Navbar/>}
      {!isBareLayout && <hr className='border-line'/>}
      <div className={isBareLayout ? '' : 'flex w-full'}>
        {!isBareLayout && <Sidebar/>}
        <div className={isBareLayout ? '' : 'w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-ink'}>
          <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/' element={<Navigate to='/login' replace/>}/>
            <Route path='/analytics' element={<Analytics/>}/>
            <Route path='/vendor-approval' element={<VendorApproval/>}/>
            <Route path='/refunds' element={<RefundQueue/>}/>
            <Route path='/categories' element={<Categories/>}/>
            <Route path='/commission' element={<Commission/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App