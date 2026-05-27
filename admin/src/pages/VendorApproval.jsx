import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const VendorCard = ({ vendor, onApprove, onReject }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState('');

    const handleReject = () => {
        if (!reason.trim()){
            toast.error('Add a reason for rejection');
            return;
        }
        onReject(vendor._id, reason);
    }

    return (
        <div className='border border-line bg-paper p-5 md:p-6'>

            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4'>
                <div>
                    <p className='font-medium text-lg'>{vendor.shopName}</p>
                    <p className='text-sm text-ink-soft'>{vendor.ownerName}{vendor.city ? `  -   ${vendor.city}` : ''}</p>
                </div>
                <p className='text-xs text-ink-soft'>Applied {vendor.appliedDate}</p>
            </div>

            <p className='text-sm mb-4'>{vendor.description}</p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-soft mb-5'>
                <p><span className='text-ink-soft'>Email:</span> <span className='text-ink'>{vendor.email}</span></p>
                <p><span className='text-ink-soft'>Phone:</span> <span className='text-ink'>{vendor.phone || 'Not provided'}</span></p>
            </div>

            {isRejecting ? (
                <div className='flex flex-col gap-2 border-t border-line pt-4'>
                    <p className='text-xs text-ink-soft tracking-wider'>REJECTION REASON</p>
                    <textarea
                        value={reason}
                        onChange={(e)=>setReason(e.target.value)}
                        rows={2}
                        placeholder='Tell the applicant why their application was rejected.'
                        className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                    />
                    <div className='flex gap-2 mt-2'>
                        <button onClick={handleReject} className='px-4 py-2 bg-brick text-paper text-sm hover:bg-ink transition-colors'>
                            Confirm reject
                        </button>
                        <button onClick={()=>{setIsRejecting(false); setReason('')}} className='px-4 py-2 border border-line text-sm hover:bg-line transition-colors'>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className='flex gap-2 border-t border-line pt-4'>
                    <button onClick={()=>onApprove(vendor._id)} className='px-5 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'>
                        Approve
                    </button>
                    <button onClick={()=>setIsRejecting(true)} className='px-5 py-2 border border-brick text-brick text-sm hover:bg-brick hover:text-paper transition-colors'>
                        Reject
                    </button>
                </div>
            )}

        </div>
    )
}

const VendorApproval = () => {

    const [pending, setPending] = useState([]);

    const fetchPending = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/admin/vendors/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const vendors = res.data.map(v => ({
                _id: v._id,
                shopName: v.storeName,
                ownerName: v.user?.name || '',
                email: v.user?.email || '',
                phone: v.phone || v.user?.phone || '',
                description: v.storeDescription || '',
                appliedDate: v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            }));
            setPending(vendors);
        } catch (err) {
            toast.error('Failed to load pending vendors');
        }
    }

    const approveVendor = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API}/vendors/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPending(prev => prev.filter(v => v._id !== id));
            toast.success('Vendor approved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve vendor');
        }
    }

    const rejectVendor = async (id, reason) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${API}/vendors/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPending(prev => prev.filter(v => v._id !== id));
            toast.success('Vendor rejected');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject vendor');
        }
    }

    useEffect(()=>{
        fetchPending();
    },[])

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>Vendor Approval Queue</h3>
                <p className='text-sm text-ink-soft'>{pending.length} pending</p>
            </div>

            <div className='flex flex-col gap-4'>
                {pending.map((v) => (
                    <VendorCard key={v._id} vendor={v} onApprove={approveVendor} onReject={rejectVendor}/>
                ))}

                {pending.length === 0 && (
                    <div className='text-center py-20 text-ink-soft'>
                        <p>No pending vendor applications. Nice work.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VendorApproval