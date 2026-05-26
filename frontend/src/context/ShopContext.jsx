import React, { createContext, useState, useMemo, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import api from '../api/axiosInstance'

export const ShopContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const normalizeProduct = (p) => ({
    ...p,
    image: p.images || [],
    rating: p.averageRating || 0,
    totalReviews: p.totalReviews || 0,
    vendor: p.vendor?.storeName || p.vendor || '',
    vendorId: p.vendor?._id || null,
    category: p.category?.name || p.category || '',
});

const ShopContextProvider = (props) => {
    const currency = '₹';
    const delivery_fee = 4900;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'token') setToken(e.newValue);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/products?limit=50`)
            .then(res => setProducts(res.data.products.map(normalizeProduct)))
            .catch(() => {})
            .finally(() => setProductsLoading(false));
    }, []);

    useEffect(() => {
        if (!token) {
            setWishlist([]);
            setCartItems({});
            return;
        }

        api.get('/wishlist')
            .then(res => setWishlist(res.data.items.map(i => i.product._id.toString())))
            .catch(() => {});

        api.get('/cart')
            .then(res => {
                const cartData = {};
                for (const item of res.data.items) {
                    cartData[item.product._id.toString()] = { default: item.quantity };
                }
                setCartItems(cartData);
            })
            .catch(() => {});
    }, [token]);

    const toggleWishlist = async (itemId) => {
        const inWishlist = wishlist.includes(itemId);
        setWishlist(prev =>
            inWishlist ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
        toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');

        if (!token) return;

        try {
            if (inWishlist) {
                await api.delete(`/wishlist/items/${itemId}`);
            } else {
                await api.post('/wishlist/items', { productId: itemId });
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
        localStorage.removeItem('refreshToken');
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
            cartData[itemId][key] = (cartData[itemId][key] || 0) + quantity;
        } else {
            cartData[itemId] = { [key]: quantity };
        }
        setCartItems(cartData);
        toast.success('Added to cart');

        if (!token) return;
        try {
            await api.post('/cart/items', { productId: itemId, quantity });
        } catch {
            // local state intact, backend out of sync — reconciles on next load
        }
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) totalCount += cartItems[items][item];
                } catch (error) {
                    console.error(error);
                }
            }
        }
        return totalCount;
    };

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        if (!token) return;
        try {
            if (quantity === 0) {
                await api.delete(`/cart/items/${itemId}`);
            } else {
                await api.put(`/cart/items/${itemId}`, { quantity });
            }
        } catch {
            // local state intact
        }
    };

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
    };

    const value = useMemo(() => ({
        products,
        productsLoading,
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
    }), [search, showSearch, cartItems, wishlist, token, products, productsLoading]);

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider
