import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import Edit from './pages/Edit'
import List from './pages/List'
import Orders from './pages/Orders'
import Earnings from './pages/Earnings'
import Payouts from './pages/Payouts'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Pending from './pages/Pending'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotFound from './pages/NotFound'

const App = () => {

  const location = useLocation();
  const bareLayoutRoutes = ['/register', '/pending'];
  const isBareLayout = bareLayoutRoutes.includes(location.pathname);

  return (
    <div className='bg-paper min-h-screen'>
      <ToastContainer/>
      {!isBareLayout && <Navbar/>}
      {!isBareLayout && <hr className='border-line'/>}
      <div className={isBareLayout ? '' : 'flex w-full'}>
        {!isBareLayout && <Sidebar/>}
        <div className={isBareLayout ? '' : 'w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-ink'}>
          <Routes>
            <Route path='/register' element={<Register/>}/>
            <Route path='/pending' element={<Pending/>}/>
            <Route path='/' element={<Navigate to='/add' replace/>}/>
            <Route path='/add' element={<Add/>}/>
            <Route path='/edit/:id' element={<Edit/>}/>
            <Route path='/list' element={<List/>}/>
            <Route path='/orders' element={<Orders/>}/>
            <Route path='/earnings' element={<Earnings/>}/>
            <Route path='/payouts' element={<Payouts/>}/>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App