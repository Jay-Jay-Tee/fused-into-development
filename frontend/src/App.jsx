import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import React from 'react'
import {Routes,Route} from 'react-router-dom'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Navbar from './components/Navbar'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import Profile from './pages/Profile'
import VendorShop from './pages/VendorShop'
import PrivacyPolicy from './pages/PrivacyPolicy'
import SearchBar from './components/SearchBar'
import Footer from './components/Footer'

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
            <Route path='/place-order' element={<PlaceOrder/>} />
            <Route path='/orders' element={<Orders/>} />
            <Route path='/wishlist' element={<Wishlist/>} />
            <Route path='/profile' element={<Profile/>} />
            <Route path='/vendor/:vendorId' element={<VendorShop/>} />
            <Route path='/privacy-policy' element={<PrivacyPolicy/>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
    </div>

  )
}

export default App