import React,{createContext,useState,useEffect}from 'react'
import {products} from '../assets/assets'
import {toast} from 'react-toastify'
export const ShopContext=createContext();
const ShopContextProvider=(props)=>{
    const currency='₹';
    const delivery_fee=49;
    const [search,setSearch]=useState('');
    const [showSearch,setShowSearch]=useState(false);
    const [cartItems,setCartItems]=useState({});

    const addToCart=async(itemId,size,quantity=1)=>{
       if (!size && products.find(p=>p._id===itemId)?.sizes?.length>0){
           toast.error('Select product size');
           return;
        } 
        let cartData=structuredClone(cartItems);
        const key=size||'default';
            if (cartData[itemId]){
                if (cartData[itemId][key]){
                    cartData[itemId][key]+=quantity;
                } else {
                    cartData[itemId][key]=quantity;
                }
            } else {
            cartData[itemId]={};
            cartData[itemId][key]=quantity;
        }
        setCartItems(cartData);
        toast.success('Added to cart');
    }

    const getCartCount=()=>{
        let totalCount=0;
        for (const items in cartItems){
            for (const item in cartItems[items]){
                try {
                    if (cartItems[items][item]>0){
                        totalCount+=cartItems[items][item];
                    }
                } catch(error){}
            }
        }
        return totalCount;
    }

    const updateQuantity=async(itemId,size,quantity)=>{
        let cartData=structuredClone(cartItems);
        cartData[itemId][size]=quantity;
        setCartItems(cartData);
    }

    const getCartAmount=()=>{
        let totalAmount=0;
        for (const items in cartItems){
            let itemInfo=products.find(p=>p._id===items);
            for (const item in cartItems[items]){
                try {
                    if (cartItems[items][item]>0){
                        totalAmount+=itemInfo.price*cartItems[items][item];
                    }
                } catch(error){}
            }
        }
        return totalAmount;
    }

    const value={
        products,
        currency,
        delivery_fee,
        search,setSearch,
        showSearch,setShowSearch,
        cartItems,setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider