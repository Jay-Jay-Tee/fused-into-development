import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import React, { useContext } from 'react'
import {Routes,Route, Navigate} from 'react-router-dom'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import OrderConfirmation from './pages/OrderConfirmation'
import Navbar from './components/Navbar'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import VendorShop from './pages/VendorShop'
import PrivacyPolicy from './pages/PrivacyPolicy'
import SearchBar from './components/SearchBar'
import Footer from './components/Footer'
import { ShopContext } from './context/ShopContext'

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(ShopContext);
  if (!token) return <Navigate to='/login' replace />;
  return children;
};

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <Navbar />
        <ToastContainer />
        <SearchBar/>
        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/collection' element={<Collection/>} />
            <Route path='/about' element={<About/>} />
            <Route path='/contact' element={<Contact/>} />
            <Route path='/product/:productId' element={<Product/>} />
            <Route path='/cart' element={<Cart/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/place-order' element={<ProtectedRoute><PlaceOrder/></ProtectedRoute>} />
            <Route path='/order-confirmation' element={<ProtectedRoute><OrderConfirmation/></ProtectedRoute>} />
            <Route path='/orders' element={<ProtectedRoute><Orders/></ProtectedRoute>} />
            <Route path='/wishlist' element={<ProtectedRoute><Wishlist/></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path='/vendor/:vendorId' element={<VendorShop/>} />
            <Route path='/privacy-policy' element={<PrivacyPolicy/>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
    </div>

  )
}

export default App