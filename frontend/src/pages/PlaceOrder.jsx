import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    createOrder as createBackendOrder,
    createRazorpayOrder,
    verifyRazorpayPayment,
} from '../api/payments'

const STORAGE_KEY = 'vendorhub_addresses';

const PlaceOrder = () => {

    const [method, setMethod]=useState('cod');
    const [submitting, setSubmitting] = useState(false);
    const {cartItems, setCartItems, getCartAmount, token, products, delivery_fee} = useContext(ShopContext);
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const [formData, setFormData] = useState({
        firstName:'',
        lastName:'',
        email:'',
        street:'',
        city:'',
        state:'',
        zipcode:'',
        country:'',
        phone:''
    });

    useEffect(()=>{
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored){
            const addrs = JSON.parse(stored);
            setSavedAddresses(addrs);
            if (addrs.length > 0){
                setSelectedAddressId(addrs[0].id);
            } else {
                setUseNewAddress(true);
            }
        } else {
            setUseNewAddress(true);
        }
    },[])

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({...data, [name]:value}));
    }

    const buildOrderItems = () => {
        const items = [];
        for (const productId in cartItems) {
            const product = products.find(p => p._id === productId);
            if (!product) continue;
            let quantity = 0;
            for (const size in cartItems[productId]) {
                quantity += cartItems[productId][size];
            }
            if (quantity > 0) {
                items.push({ product: productId, quantity });
            }
        }
        return items;
    }

    const openRazorpayCheckout = ({ orderId, razorpayOrderId, amount, currency, address }) => {
        return new Promise((resolve, reject) => {
            if (typeof window.Razorpay === 'undefined') {
                reject(new Error('Razorpay SDK failed to load'));
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'VendorHub',
                description: 'Order Payment',
                order_id: razorpayOrderId,
                prefill: {
                    name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
                    email: address.email || '',
                    contact: address.phone || '',
                },
                theme: { color: '#1e3a5f' },
                handler: async (response) => {
                    try {
                        await verifyRazorpayPayment({
                            orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            token,
                        });
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },
                modal: {
                    ondismiss: () => reject(new Error('Payment cancelled')),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                reject(new Error(response.error?.description || 'Payment failed'));
            });
            rzp.open();
        });
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!token) {
            toast.error('Please log in to place an order');
            navigate('/login');
            return;
        }
        if (getCartAmount() === 0){
            toast.error('Your cart is empty');
            return;
        }
        const finalAddress = useNewAddress
            ? formData
            : savedAddresses.find(a => a.id === selectedAddressId);
        if (!finalAddress){
            toast.error('Select or enter an address');
            return;
        }

        const items = buildOrderItems();
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const shippingAddress = {
            addressLine1: finalAddress.street,
            city: finalAddress.city,
            state: finalAddress.state,
            pinCode: finalAddress.zipcode,
            country: finalAddress.country,
        };

        setSubmitting(true);
        try {
            const order = await createBackendOrder({ items, shippingAddress, token });
            const orderId = order._id || order.data?._id;

            if (method === 'razorpay') {
                const rzpOrder = await createRazorpayOrder({ orderId, token });
                await openRazorpayCheckout({
                    orderId,
                    razorpayOrderId: rzpOrder.razorpayOrderId,
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    address: finalAddress,
                });
                toast.success('Payment successful');
            } else if (method === 'cod') {
                toast.success('Order placed (Cash on delivery)');
            } else {
                toast.info(`${method.toUpperCase()} payment is not yet configured`);
                return;
            }

            setCartItems({});
            navigate('/orders');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Something went wrong';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-line'>

            {/* Left side - address */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'ADDRESS'}/>
                </div>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && !useNewAddress && (
                    <div className='flex flex-col gap-3'>
                        {savedAddresses.map((addr) => (
                            <div
                                key={addr.id}
                                onClick={()=>setSelectedAddressId(addr.id)}
                                className={`border p-4 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-navy bg-mustard/10' : 'border-line hover:border-ink-soft'}`}
                            >
                                <div className='flex items-start gap-3'>
                                    <div className={`min-w-4 h-4 rounded-full border-2 mt-0.5 ${selectedAddressId === addr.id ? 'border-navy bg-navy' : 'border-line'}`}></div>
                                    <div className='flex-1'>
                                        <p className='text-xs font-medium tracking-wider text-ink-soft mb-1'>{addr.label || 'ADDRESS'}</p>
                                        <p className='font-medium text-sm'>{addr.firstName} {addr.lastName}</p>
                                        <p className='text-sm text-ink-soft'>{addr.street}, {addr.city}, {addr.state} {addr.zipcode}</p>
                                        <p className='text-sm text-ink-soft mt-1'>📞 {addr.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type='button' onClick={()=>setUseNewAddress(true)} className='text-sm text-ink-soft hover:text-ink underline text-left'>
                            + Use a different address
                        </button>
                    </div>
                )}

                {/* New address form */}
                {(savedAddresses.length === 0 || useNewAddress) && (
                    <>
                        {savedAddresses.length > 0 && (
                            <button type='button' onClick={()=>setUseNewAddress(false)} className='text-sm text-ink-soft hover:text-ink underline text-left mb-2'>
                                ← Use a saved address
                            </button>
                        )}
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='First name'/>
                            <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='Last name'/>
                        </div>
                        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='email' placeholder='Email address'/>
                        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='Street'/>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='City'/>
                            <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='State'/>
                        </div>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' pattern='[0-9]{6}' title='6-digit Indian pincode' placeholder='Pincode'/>
                            <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='text' placeholder='Country'/>
                        </div>
                        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy bg-paper' type='tel' pattern='[6-9][0-9]{9}' title='10-digit Indian mobile number' placeholder='Phone number'/>
                    </>
                )}
            </div>

            {/* Right side - cart total + payment method */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal/>
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'}/>
                    <div className='flex gap-3 flex-col lg:flex-row mt-4'>
                        <div onClick={()=>setMethod('razorpay')} className='flex items-center gap-3 border border-line p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='razorpay' ? 'bg-navy border-navy' : 'border-line'}`}></p>
                            <p className='text-ink-soft text-sm font-medium mx-4'>RAZORPAY</p>
                        </div>
                        <div onClick={()=>setMethod('stripe')} className='flex items-center gap-3 border border-line p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='stripe' ? 'bg-navy border-navy' : 'border-line'}`}></p>
                            <p className='text-ink-soft text-sm font-medium mx-4'>STRIPE</p>
                        </div>
                        <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border border-line p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method==='cod' ? 'bg-navy border-navy' : 'border-line'}`}></p>
                            <p className='text-ink-soft text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button type='submit' disabled={submitting} className='bg-ink text-paper px-16 py-3 text-sm hover:bg-navy transition-colors disabled:opacity-60 disabled:cursor-not-allowed'>
                            {submitting ? 'PROCESSING...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>

        </form>
    )
}

export default PlaceOrder
