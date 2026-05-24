import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { formatINR } from '../utils/money'

const Orders = () => {

    const {products} = useContext(ShopContext);
    // Backend wiring later - for now showing recent products as orders
    const orderHistory=products.slice(0,5).map((product,i)=>({
        ...product,
        orderDate:new Date(Date.now()-i*86400000).toDateString(),
        orderQuantity:i+1,
        paymentMethod:i%2===0? 'COD':'Razorpay',
        status:['Order Placed','Packing','Shipped','Out for delivery','Delivered'][i],
    }));
    const getStatusColor=(status)=>{
        switch (status){
            case 'Delivered':return 'bg-green-500';
            case 'Out for delivery':return 'bg-mustard';
            case 'Shipped':return 'bg-navy';
            case 'Packing':return 'bg-brick';
            default:return 'bg-ink-soft';
        }
    }
    return (
        <div className='border-t border-line pt-16'>
            <div className='text-2xl'>
                <Title text1={'MY'} text2={'ORDERS'}/>
            </div>
            <div>
                {orderHistory.length===0 ?(
                    <div className='text-center py-20 text-ink-soft'>
                        <p>You haven't placed any orders yet.</p>
                    </div>
                ):orderHistory.map((item)=>(
                    <div key={item._id} className='py-4 border-t border-b border-line text-ink-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div className='flex items-start gap-6 text-sm'>
                            <img className='w-16 sm:w-20' src={item.image[0]} alt=""/>
                            <div>
                                <p className='sm:text-base font-medium text-ink'>{item.name}</p>
                                <p className='text-xs text-ink-soft mt-1'>Sold by {item.vendor} · 📍 {item.location}</p>
                                <div className='flex items-center gap-3 mt-2 text-ink-soft'>
                                    <p>{formatINR(item.price)}</p>
                                    <p>Quantity: {item.orderQuantity}</p>
                                    <p>Payment: {item.paymentMethod}</p>
                                </div>
                                <p className='mt-1 text-xs'>Date: <span className='text-ink-soft'>{item.orderDate}</span></p>
                            </div>
                        </div>
                        <div className='md:w-1/2 flex justify-between items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <p className={`min-w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></p>
                                <p className='text-sm md:text-base text-ink'>{item.status}</p>
                            </div>
                            <button className='border border-line text-sm font-medium px-4 py-2 hover:bg-ink hover:text-paper transition-colors'>
                                Track Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders