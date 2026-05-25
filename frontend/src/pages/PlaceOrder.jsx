import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { ShopContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod]=useState('cod');
    const {setCartItems, getCartAmount} = useContext(ShopContext);
    const navigate = useNavigate();

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

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({...data, [name]:value}));
    }

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (getCartAmount() === 0){
            toast.error('Your cart is empty');
            return;
        }
        // Backend wiring later
        toast.success('Order placed');
        setCartItems({});
        navigate('/orders');
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-line'>

            {/* Left side - delivery info */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='First name'/>
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='Last name'/>
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='email' placeholder='Email address'/>
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='Street'/>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='City'/>
                    <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='State'/>
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' pattern='[0-9]{6}' title='6-digit Indian pincode' placeholder='Pincode'/>
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='text' placeholder='Country'/>
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-line py-1.5 px-3.5 w-full outline-none focus:border-navy' type='tel' pattern='[6-9][0-9]{9}' title='10-digit Indian mobile number' placeholder='Phone number'/>
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
                        <button type='submit' className='bg-ink text-paper px-16 py-3 text-sm hover:bg-navy transition-colors'>
                            PLACE ORDER
                        </button>
                    </div>
                </div>
            </div>

        </form>
    )
}

export default PlaceOrder