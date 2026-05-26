import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axiosInstance'

const loadRazorpay = () =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const STORAGE_KEY = 'vendorhub_addresses';

const PlaceOrder = () => {
    const [method, setMethod] = useState('razorpay');
    const { cartItems, products, setCartItems, getCartAmount, token } = useContext(ShopContext);
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        street: '', city: '', state: '', pincode: '', country: 'India', phone: '',
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const addrs = JSON.parse(stored);
            setSavedAddresses(addrs);
            if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
            else setUseNewAddress(true);
        } else {
            setUseNewAddress(true);
        }
    }, []);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(d => ({ ...d, [name]: value }));
    };

    const buildOrderItems = () => {
        const items = [];
        for (const productId in cartItems) {
            for (const size in cartItems[productId]) {
                const qty = cartItems[productId][size];
                if (qty > 0) items.push({ product: productId, quantity: qty });
            }
        }
        return items;
    };

    const buildShippingAddress = () => {
        if (!useNewAddress && selectedAddressId) {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (addr) return {
                firstName: addr.firstName, lastName: addr.lastName,
                street: addr.street, city: addr.city, state: addr.state,
                pincode: addr.zipcode || addr.pincode, country: addr.country, phone: addr.phone,
            };
        }
        return {
            firstName: formData.firstName, lastName: formData.lastName,
            street: formData.street, city: formData.city, state: formData.state,
            pincode: formData.pincode, country: formData.country, phone: formData.phone,
        };
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!token) { toast.error('Sign in to place an order'); navigate('/login'); return; }
        if (getCartAmount() === 0) { toast.error('Your cart is empty'); return; }

        const shippingAddress = buildShippingAddress();
        if (!shippingAddress) { toast.error('Select or enter a delivery address'); return; }

        const items = buildOrderItems();
        if (items.length === 0) { toast.error('Your cart is empty'); return; }

        setLoading(true);
        try {
            // Step 1: Create order
            const orderRes = await api.post('/orders', { items, shippingAddress });
            const order = orderRes.data;

            if (method !== 'razorpay') {
                toast.error('Only Razorpay is supported right now');
                setLoading(false);
                return;
            }

            // Step 2: Create Razorpay payment session
            const ok = await loadRazorpay();
            if (!ok) { toast.error('Failed to load Razorpay. Check your connection.'); setLoading(false); return; }

            const payRes = await api.post('/payments/create-order', { orderId: order._id });
            const { razorpayOrderId, amount, currency } = payRes.data;

            // Step 3: Open Razorpay checkout
            const rzpOptions = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'VendorHub',
                order_id: razorpayOrderId,
                handler: async (response) => {
                    try {
                        await api.post('/payments/verify', {
                            razorpayOrderId:   response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature:  response.razorpay_signature,
                            orderId:            order._id,
                        });
                        setCartItems({});
                        toast.success('Payment successful! Order confirmed.');
                        navigate('/orders');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
                theme: { color: '#1A1A1A' },
            };
            new window.Razorpay(rzpOptions).open();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-line'>

            {/* Left — delivery address */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'ADDRESS'}/>
                </div>

                {savedAddresses.length > 0 && !useNewAddress && (
                    <div className='flex flex-col gap-3'>
                        {savedAddresses.map((addr) => (
                            <div
                                key={addr.id}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`border p-4 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-navy bg-mustard/10' : 'border-line hover:border-ink-soft'}`}
                            >
                                <div className='flex items-start gap-3'>
                                    <div className={`min-w-4 h-4 rounded-full border-2 mt-0.5 ${selectedAddressId === addr.id ? 'border-navy bg-navy' : 'border-line'}`}/>
                                    <div className='flex-1'>
                                        <p className='text-xs font-medium tracking-wider text-ink-soft mb-1'>{addr.label || 'ADDRESS'}</p>
                                        <p className='font-medium text-sm'>{addr.firstName} {addr.lastName}</p>
                                        <p className='text-sm text-ink-soft'>{addr.street}, {addr.city}, {addr.state} {addr.zipcode || addr.pincode}</p>
                                        <p className='text-sm text-ink-soft mt-1'>📞 {addr.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type='button' onClick={() => setUseNewAddress(true)} className='text-sm text-ink-soft hover:text-ink underline text-left'>
                            + Use a different address
                        </button>
                    </div>
                )}

                {(savedAddresses.length === 0 || useNewAddress) && (
                    <>
                        {savedAddresses.length > 0 && (
                            <button type='button' onClick={() => setUseNewAddress(false)} className='text-sm text-ink-soft hover:text-ink underline text-left mb-2'>
                                ← Use a saved address
                            </button>
                        )}
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='First name'/>
                            <input required onChange={onChangeHandler} name='lastName'  value={formData.lastName}  className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='Last name'/>
                        </div>
                        <input required onChange={onChangeHandler} name='email'   value={formData.email}   className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='email' placeholder='Email address'/>
                        <input required onChange={onChangeHandler} name='street'  value={formData.street}  className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text'  placeholder='Street'/>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='city'    value={formData.city}    className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='City'/>
                            <input required onChange={onChangeHandler} name='state'   value={formData.state}   className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='State'/>
                        </div>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='pincode' value={formData.pincode} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' pattern='[0-9]{6}' title='6-digit pincode' placeholder='Pincode'/>
                            <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='Country'/>
                        </div>
                        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='tel' pattern='[6-9][0-9]{9}' title='10-digit Indian mobile number' placeholder='Phone number'/>
                    </>
                )}
            </div>

            {/* Right — total + payment */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal/>
                </div>
                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'}/>
                    <div className='flex gap-3 flex-col lg:flex-row mt-4'>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border border-line p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-navy border-navy' : 'border-line'}`}/>
                            <p className='text-ink-soft text-sm font-medium mx-4'>RAZORPAY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button type='submit' disabled={loading} className='bg-ink text-paper px-16 py-3 text-sm hover:bg-navy transition-colors disabled:opacity-50'>
                            {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder
