import React, { useEffect, useState } from 'react'
import { formatINR } from '../utils/money'
import { toast } from 'react-toastify'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Payouts = () => {

    const [payouts, setPayouts] = useState([]);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API}/vendors/my/payouts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data || [];
            setPayouts(data);
            const pending = data
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + (p.totalRevenue - p.commissionDeducted), 0);
            setPendingBalance(pending);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center py-20'>
                <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'/>
            </div>
        );
    }

    return (
        <div>
            <h3 className='mb-6 font-medium'>Payout History</h3>

            <div className='border border-line bg-paper p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>PENDING BALANCE</p>
                    <p className='text-3xl font-medium'>{formatINR(pendingBalance)}</p>
                    <p className='text-xs text-ink-soft mt-2'>Next payout on the 1st of next month</p>
                </div>
            </div>

            <div className='border border-line bg-paper'>
                <p className='text-sm font-medium p-4 border-b border-line'>Past payouts</p>
                <div>
                    <div className='hidden md:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                        <p>PERIOD</p>
                        <p>ORDERS</p>
                        <p>AMOUNT</p>
                        <p>TRANSACTION ID</p>
                        <p className='text-right'>STATUS</p>
                    </div>
                    {payouts.map((p) => (
                        <div key={p._id} className='grid grid-cols-[1.5fr_1fr] md:grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] py-3 px-4 text-sm border-b border-line last:border-b-0 gap-2'>
                            <p>{MONTH_NAMES[(p.month || 1) - 1]} {p.year}</p>
                            <p className='hidden md:block'>{p.totalOrders}</p>
                            <p className='hidden md:block font-medium'>{formatINR(p.totalRevenue - p.commissionDeducted)}</p>
                            <p className='hidden md:block font-mono text-xs text-ink-soft self-center'>{p.paymentInfo?.transactionId || '-'}</p>
                            <p className='text-right'>
                                <span className={`text-[10px] px-2 py-1 rounded text-paper ${p.status === 'paid' ? 'bg-green-600' : 'bg-mustard text-ink'}`}>
                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                </span>
                            </p>
                        </div>
                    ))}
                    {payouts.length === 0 && (
                        <div className='text-center py-12 text-ink-soft text-sm'>
                            <p>No payouts yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payouts
