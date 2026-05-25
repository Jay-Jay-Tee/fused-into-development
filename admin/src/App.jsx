import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import VendorApproval from './pages/VendorApproval'
import RefundQueue from './pages/RefundQueue'
import Categories from './pages/Categories'
import Commission from './pages/Commission'
import Analytics from './pages/Analytics'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <div className='bg-paper min-h-screen'>
      <ToastContainer/>
      <Navbar/>
      <hr className='border-line'/>
      <div className='flex w-full'>
        <Sidebar/>
        <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-ink'>
          <Routes>
            <Route path='/' element={<Navigate to='/analytics' replace/>}/>
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