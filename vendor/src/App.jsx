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
import Login from './pages/Login'
import Pending from './pages/Pending'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to='/login' replace />;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'vendor') return <Navigate to='/pending' replace />;
    } catch {
        return <Navigate to='/login' replace />;
    }
    return children;
};

const App = () => {

    const location = useLocation();
    const bareLayoutRoutes = ['/register', '/pending', '/login'];
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
                        <Route path='/login' element={<Login/>}/>
                        <Route path='/register' element={<Register/>}/>
                        <Route path='/pending' element={<Pending/>}/>
                        <Route path='/' element={<ProtectedRoute><Navigate to='/add' replace/></ProtectedRoute>}/>
                        <Route path='/add' element={<ProtectedRoute><Add/></ProtectedRoute>}/>
                        <Route path='/edit/:id' element={<ProtectedRoute><Edit/></ProtectedRoute>}/>
                        <Route path='/list' element={<ProtectedRoute><List/></ProtectedRoute>}/>
                        <Route path='/orders' element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
                        <Route path='/earnings' element={<ProtectedRoute><Earnings/></ProtectedRoute>}/>
                        <Route path='/payouts' element={<ProtectedRoute><Payouts/></ProtectedRoute>}/>
                        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                        <Route path='*' element={<NotFound/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App
