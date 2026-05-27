import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const RefundCard = ({ refund, onApprove, onReject }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    const handleReject = () => {
        if (!adminNote.trim()){
            toast.error('Add a note for rejection');
            return;
        }
        onReject(refund._id, adminNote);
    }

    return (
        <div className='border border-line bg-paper p-5 md:p-6'>

            <div className='flex flex-col md:flex-row gap-4 md:gap-6 mb-4'>
                <img src={refund.itemImage} className='w-20 h-20 object-cover border border-line' alt=""/>
                <div className='flex-1'>
                    <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2'>
                        <p className='font-medium'>{refund.itemName}</p>
                        <p className='text-xs text-ink-soft'>Requested {refund.requestedAt}</p>
                    </div>
                    <p className='text-xs text-ink-soft mb-3'>Qty {refund.quantity}  -  Order #{refund.orderId}</p>
                    <p className='text-sm bg-paper border-l-2 border-mustard pl-3 py-1'>
                        {refund.reason}
                    </p>
                </div>
                <div className='text-right md:min-w-[140px]'>
                    <p className='text-xs text-ink-soft tracking-wider'>REFUND AMOUNT</p>
                    <p className='text-2xl font-medium'>{formatINR(refund.amount)}</p>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-soft mb-5 pt-3 border-t border-line'>
                <p><span>Buyer:</span> <span className='text-ink'>{refund.buyerName}</span></p>
                <p><span>Contact:</span> <span className='text-ink'>{refund.buyerEmail}</span></p>
            </div>

            {isRejecting ? (
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
                        <button onClick={handleReject} className='px-4 py-2 bg-brick text-paper text-sm hover:bg-ink transition-colors'>
                            Confirm reject
                        </button>
                        <button onClick={()=>{setIsRejecting(false); setAdminNote('')}} className='px-4 py-2 border border-line text-sm hover:bg-line transition-colors'>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className='flex gap-2'>
                    <button onClick={()=>onApprove(refund._id)} className='px-5 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                        Approve refund
                    </button>
                    <button onClick={()=>setIsRejecting(true)} className='px-5 py-2 border border-brick text-brick text-sm hover:bg-brick hover:text-paper transition-colors'>
                        Reject
                    </button>
                </div>
            )}

        </div>
    )
}

const RefundQueue = () => {

    const [refunds, setRefunds] = useState([]);

    const fetchRefunds = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/refunds`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const mapped = (res.data.refunds || res.data).map(r => ({
                _id: r._id,
                buyerName: r.buyer?.name || 'Unknown',
                buyerEmail: r.buyer?.email || '',
                orderId: r.order?._id || r.order,
                itemName: r.item?.name || '',
                itemImage: r.item?.image || '',
                quantity: r.item?.quantity || 1,
                amount: r.refundAmount,
                reason: r.reason,
                requestedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            }));
            setRefunds(mapped);
        } catch (err) {
            toast.error('Failed to load refunds');
        }
    }

    const approveRefund = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API}/refunds/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRefunds(prev => prev.filter(r => r._id !== id));
            toast.success('Refund approved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve refund');
        }
    }

    const rejectRefund = async (id, adminNote) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API}/refunds/${id}/reject`, { adminNote }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRefunds(prev => prev.filter(r => r._id !== id));
            toast.success('Refund rejected');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject refund');
        }
    }

    useEffect(()=>{
        fetchRefunds();
    },[])

    const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>Refund Queue</h3>
                <p className='text-sm text-ink-soft'>{refunds.length} pending  -  {formatINR(totalAmount)} at risk</p>
            </div>

            <div className='flex flex-col gap-4'>
                {refunds.map((r) => (
                    <RefundCard key={r._id} refund={r} onApprove={approveRefund} onReject={rejectRefund}/>
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