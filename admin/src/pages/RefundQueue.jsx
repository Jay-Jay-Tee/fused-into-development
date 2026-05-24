import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const RefundQueue = () => {

    const [refunds, setRefunds] = useState([]);
    const [rejectingId, setRejectingId] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    const fetchRefunds = async () => {
        // Backend wiring later
        const mockRefunds = [
            {
                _id: 'r001',
                buyerName: 'Riya Sharma',
                buyerEmail: 'riya.sharma@gmail.com',
                orderId: 'o228',
                itemName: 'Brass desk lamp',
                itemImage: 'https://picsum.photos/seed/v002/300/400',
                quantity: 1,
                amount: 249900,
                reason: 'Product arrived damaged. Top of the lamp has a dent near the bulb socket.',
                requestedAt: 'May 22, 2026',
            },
            {
                _id: 'r002',
                buyerName: 'Aarav Mehta',
                buyerEmail: 'aarav.m@yahoo.com',
                orderId: 'o241',
                itemName: 'Cotton handloom kurta',
                itemImage: 'https://picsum.photos/seed/v001/300/400',
                quantity: 2,
                amount: 259800,
                reason: 'Wrong size delivered. Ordered M but received XL.',
                requestedAt: 'May 23, 2026',
            },
            {
                _id: 'r003',
                buyerName: 'Karan Iyer',
                buyerEmail: 'k.iyer@outlook.com',
                orderId: 'o252',
                itemName: 'Khadi cotton shirt',
                itemImage: 'https://picsum.photos/seed/v005/300/400',
                quantity: 1,
                amount: 159900,
                reason: 'Changed my mind, no longer need it.',
                requestedAt: 'May 24, 2026',
            },
        ];
        setRefunds(mockRefunds);
    }

    const approveRefund = async (id) => {
        // Backend wiring later
        setRefunds(prev => prev.filter(r => r._id !== id));
        toast.success('Refund approved');
    }

    const rejectRefund = async (id) => {
        if (!adminNote.trim()){
            toast.error('Add a note for rejection');
            return;
        }
        // Backend wiring later
        setRefunds(prev => prev.filter(r => r._id !== id));
        toast.success('Refund rejected');
        setRejectingId(null);
        setAdminNote('');
    }

    useEffect(()=>{
        fetchRefunds();
    },[])

    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>Refund Queue</h3>
                <p className='text-sm text-ink-soft'>{refunds.length} pending · ₹{totalAmount.toLocaleString('en-IN')} at risk</p>
            </div>

            <div className='flex flex-col gap-4'>
                {refunds.map((r) => (
                    <div key={r._id} className='border border-line bg-paper p-5 md:p-6'>

                        <div className='flex flex-col md:flex-row gap-4 md:gap-6 mb-4'>
                            <img src={r.itemImage} className='w-20 h-20 object-cover border border-line' alt=""/>
                            <div className='flex-1'>
                                <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2'>
                                    <p className='font-medium'>{r.itemName}</p>
                                    <p className='text-xs text-ink-soft'>Requested {r.requestedAt}</p>
                                </div>
                                <p className='text-xs text-ink-soft mb-3'>Qty {r.quantity} · Order #{r.orderId}</p>
                                <p className='text-sm bg-paper border-l-2 border-mustard pl-3 py-1'>
                                    {r.reason}
                                </p>
                            </div>
                            <div className='text-right md:min-w-[140px]'>
                                <p className='text-xs text-ink-soft tracking-wider'>REFUND AMOUNT</p>
                                <p className='text-2xl font-medium'>₹{r.amount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-soft mb-5 pt-3 border-t border-line'>
                            <p><span>Buyer:</span> <span className='text-ink'>{r.buyerName}</span></p>
                            <p><span>Contact:</span> <span className='text-ink'>{r.buyerEmail}</span></p>
                        </div>

                        {rejectingId === r._id ? (
                            <div className='flex flex-col gap-2'>
                                <p className='text-xs text-ink-soft tracking-wider'>REJECTION NOTE</p>
                                <textarea
                                    value={adminNote}
                                    onChange={(e)=>setAdminNote(e.target.value)}
                                    rows={2}
                                    placeholder='Visible to the buyer. Explain why their refund was rejected.'
                                    className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                                />
                                <div className='flex gap-2 mt-2'>
                                    <button onClick={()=>rejectRefund(r._id)} className='px-4 py-2 bg-brick text-paper text-sm hover:bg-ink transition-colors'>
                                        Confirm reject
                                    </button>
                                    <button onClick={()=>{setRejectingId(null); setAdminNote('')}} className='px-4 py-2 border border-line text-sm hover:bg-line transition-colors'>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='flex gap-2'>
                                <button onClick={()=>approveRefund(r._id)} className='px-5 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                                    Approve refund
                                </button>
                                <button onClick={()=>setRejectingId(r._id)} className='px-5 py-2 border border-brick text-brick text-sm hover:bg-brick hover:text-paper transition-colors'>
                                    Reject
                                </button>
                            </div>
                        )}

                    </div>
                ))}

                {refunds.length === 0 && (
                    <div className='text-center py-20 text-ink-soft'>
                        <p>No pending refunds. Customers are happy.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RefundQueue