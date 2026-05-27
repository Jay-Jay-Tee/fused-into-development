import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import SavedAddressList from '../components/SavedAddressList'
import NewAddressForm from '../components/NewAddressForm'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axiosInstance'
import { useSavedAddresses } from '../hooks/useSavedAddresses'
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout'
import { buildOrderItems, buildShippingAddress } from '../utils/checkout'

const PlaceOrder = () => {
    const [method, setMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    const [saveAddress, setSaveAddress] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        street: '', city: '', state: '', pincode: '', country: 'India', phone: '',
    });

    const { cartItems, setCartItems, getCartAmount, token } = useContext(ShopContext);
    const navigate = useNavigate();
    const {
        savedAddresses, selectedAddressIndex, setSelectedAddressIndex,
        useNewAddress, setUseNewAddress,
        loading: addressesLoading,
    } = useSavedAddresses();
    const { pay } = useRazorpayCheckout();

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(d => ({ ...d, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!token) { toast.error('Sign in to place an order'); navigate('/login'); return; }
        if (getCartAmount() === 0) { toast.error('Your cart is empty'); return; }
        if (method !== 'razorpay') { toast.error('Only Razorpay is supported right now'); return; }

        const items = buildOrderItems(cartItems);
        if (items.length === 0) { toast.error('Your cart is empty'); return; }

        const shippingAddress = buildShippingAddress({
            useNewAddress, savedAddresses, selectedAddressIndex, formData,
        });

        setLoading(true);
        try {
            const { data: order } = await api.post('/orders', { items, shippingAddress });
            await pay(order);
            setCartItems({});
            if (useNewAddress && saveAddress) {
                api.post('/users/me/addresses', shippingAddress).catch(() => {
                    toast.warn('Order placed but address could not be saved');
                });
            }
            navigate('/order-confirmation', { state: { orderId: order._id, totalAmount: order.totalAmount } });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const showSavedList = savedAddresses.length > 0 && !useNewAddress;

    let addressSection;
    if (addressesLoading) {
        addressSection = <p className='text-sm text-ink-soft'>Loading addresses...</p>;
    } else if (showSavedList) {
        addressSection = (
            <SavedAddressList
                addresses={savedAddresses}
                selectedIndex={selectedAddressIndex}
                onSelect={setSelectedAddressIndex}
                onUseNewAddress={() => setUseNewAddress(true)}
            />
        );
    } else {
        addressSection = (
            <NewAddressForm
                formData={formData}
                onChange={onChangeHandler}
                hasSavedAddresses={savedAddresses.length > 0}
                onBack={() => setUseNewAddress(false)}
                canSave={!!token}
                saveAddress={saveAddress}
                onToggleSave={(e) => setSaveAddress(e.target.checked)}
            />
        );
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-line'>

            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'ADDRESS'}/>
                </div>

                {addressSection}
            </div>

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
