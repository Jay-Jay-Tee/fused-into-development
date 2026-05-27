import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import VendorApproval from './pages/VendorApproval'
import RefundQueue from './pages/RefundQueue'
import Categories from './pages/Categories'
import Commission from './pages/Commission'
import Analytics from './pages/Analytics'
import Users from './pages/Users'
import Orders from './pages/Orders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to='/login' replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') return <Navigate to='/login' replace />;
  } catch {
    return <Navigate to='/login' replace />;
  }
  return children;
};

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
            <Route path='/analytics' element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
            <Route path='/vendor-approval' element={<ProtectedRoute><VendorApproval/></ProtectedRoute>}/>
            <Route path='/refunds' element={<ProtectedRoute><RefundQueue/></ProtectedRoute>}/>
            <Route path='/categories' element={<ProtectedRoute><Categories/></ProtectedRoute>}/>
            <Route path='/commission' element={<ProtectedRoute><Commission/></ProtectedRoute>}/>
            <Route path='/users' element={<ProtectedRoute><Users/></ProtectedRoute>}/>
            <Route path='/orders' element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App