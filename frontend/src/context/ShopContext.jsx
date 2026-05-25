import React, { createContext, useState, useMemo, useEffect } from 'react'
import { products } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

export const ShopContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ShopContextProvider = (props) => {
    const currency = '₹';
    const delivery_fee = 4900;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            axios.get(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => {
                    setWishlist(res.data.items.map(i => i.product._id.toString()));
                })
                .catch(() => {});
        } else {
            setWishlist([]);
        }
    }, [token]);

    const toggleWishlist = async (itemId) => {
        const inWishlist = wishlist.includes(itemId);
        setWishlist(prev =>
            inWishlist
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
        toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');

        if (!token) return;

        try {
            if (inWishlist) {
                await axios.delete(`${API}/wishlist/items/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${API}/wishlist/items`, { productId: itemId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch {
            setWishlist(prev =>
                inWishlist ? [...prev, itemId] : prev.filter(id => id !== itemId)
            );
            toast.error('Could not sync wishlist');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setWishlist([]);
        setCartItems({});
    };

    const addToCart = async (itemId, size, quantity = 1) => {
        if (!size && products.find(p => p._id === itemId)?.sizes?.length > 0) {
            toast.error('Select product size');
            return;
        }
        let cartData = structuredClone(cartItems);
        const key = size || 'default';
        if (cartData[itemId]) {
            if (cartData[itemId][key]) {
                cartData[itemId][key] += quantity;
            } else {
                cartData[itemId][key] = quantity;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][key] = quantity;
        }
        setCartItems(cartData);
        toast.success('Added to cart');
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find(p => p._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        return totalAmount;
    }

    const value = useMemo(() => ({
        products,
        currency,
        delivery_fee,
        search, setSearch,
        showSearch, setShowSearch,
        cartItems, setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        wishlist, toggleWishlist,
        token, setToken,
        logout,
    }), [search, showSearch, cartItems, wishlist, token]);

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider
