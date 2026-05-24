import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

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
                    <p className='text-sm text-ink-soft'>{vendor.ownerName} · 📍 {vendor.city}</p>
                </div>
                <p className='text-xs text-ink-soft'>Applied {vendor.appliedDate}</p>
            </div>

            <p className='text-sm mb-4'>{vendor.description}</p>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-soft mb-5'>
                <p><span className='text-ink-soft'>Email:</span> <span className='text-ink'>{vendor.email}</span></p>
                <p><span className='text-ink-soft'>Phone:</span> <span className='text-ink'>{vendor.phone}</span></p>
                <p><span className='text-ink-soft'>GSTIN:</span> <span className='text-ink font-mono'>{vendor.gstin || 'Not provided'}</span></p>
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
        // Backend wiring later
        const mockPending = [
            {
                _id: 'v_app001',
                shopName: 'Tantuja Studio',
                ownerName: 'Aarav Mehta',
                email: 'aarav@tantuja.in',
                phone: '9876543210',
                city: 'Bengaluru',
                description: 'Handwoven cotton products. Family-run, three generations.',
                gstin: '29AABCT1234M1Z5',
                appliedDate: 'May 22, 2026',
            },
            {
                _id: 'v_app002',
                shopName: 'Modi Metals',
                ownerName: 'Priya Modi',
                email: 'priya@modimetals.com',
                phone: '9123456780',
                city: 'Moradabad',
                description: 'Brass and copper homeware, exporting since 1998.',
                gstin: '09AABCM5678N2Z6',
                appliedDate: 'May 23, 2026',
            },
            {
                _id: 'v_app003',
                shopName: 'Flax & Folk',
                ownerName: 'Karthik Iyer',
                email: 'hello@flaxandfolk.in',
                phone: '9988776655',
                city: 'Coimbatore',
                description: 'Heavyweight linen bags and home textiles.',
                gstin: '',
                appliedDate: 'May 24, 2026',
            },
        ];
        setPending(mockPending);
    }

    const approveVendor = (id) => {
        // Backend wiring later
        setPending(prev => prev.filter(v => v._id !== id));
        toast.success('Vendor approved');
    }

    const rejectVendor = (id, reason) => {
        // Backend wiring later - reason will be sent to backend
        console.log('Rejecting', id, 'with reason:', reason);
        setPending(prev => prev.filter(v => v._id !== id));
        toast.success('Vendor rejected');
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