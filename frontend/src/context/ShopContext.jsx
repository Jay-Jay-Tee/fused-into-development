import React, { createContext, useState, useMemo, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

export const ShopContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const normalizeProduct = (p) => ({
    ...p,
    image: p.images || [],
    rating: p.averageRating || 0,
    vendor: p.vendor?.storeName || p.vendor || '',
    vendorId: p.vendor?._id || null,
    category: p.category?.name || p.category || '',
    location: '',
    subCategory: '',
});

const ShopContextProvider = (props) => {
    const currency = '₹';
    const delivery_fee = 4900;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get(`${API}/products?limit=50`)
            .then(res => setProducts(res.data.products.map(normalizeProduct)))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!token) {
            setWishlist([]);
            setCartItems({});
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        axios.get(`${API}/wishlist`, { headers })
            .then(res => setWishlist(res.data.items.map(i => i.product._id.toString())))
            .catch(() => {});

        axios.get(`${API}/cart`, { headers })
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
            cartData[itemId][key] = (cartData[itemId][key] || 0) + quantity;
        } else {
            cartData[itemId] = { [key]: quantity };
        }
        setCartItems(cartData);
        toast.success('Added to cart');

        if (!token) return;
        try {
            await axios.post(`${API}/cart/items`, { productId: itemId, quantity }, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
                await axios.delete(`${API}/cart/items/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.put(`${API}/cart/items/${itemId}`, { quantity }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
    }), [search, showSearch, cartItems, wishlist, token, products]);

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider
