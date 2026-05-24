import React, { useEffect, useState } from 'react'
import { formatINR } from '../utils/money'

const Payouts = () => {

    const [payouts, setPayouts] = useState([]);
    const [pendingBalance, setPendingBalance] = useState(0);

    const fetchPayouts = async () => {
        // Backend wiring later
        const mockPayouts = [
            { _id: 'po001', date: 'May 15, 2026', amount: 1842000, orders: 32, status: 'Paid', utr: 'AXIS2603N456712' },
            { _id: 'po002', date: 'May 1, 2026', amount: 2215000, orders: 41, status: 'Paid', utr: 'AXIS2603N445298' },
            { _id: 'po003', date: 'Apr 15, 2026', amount: 1589000, orders: 28, status: 'Paid', utr: 'AXIS2603N430174' },
            { _id: 'po004', date: 'Apr 1, 2026', amount: 1972000, orders: 36, status: 'Paid', utr: 'AXIS2603N418855' },
            { _id: 'po005', date: 'Mar 15, 2026', amount: 1244000, orders: 23, status: 'Paid', utr: 'AXIS2603N405312' },
        ];
        setPayouts(mockPayouts);
        setPendingBalance(8740);
    }

    useEffect(()=>{
        fetchPayouts();
    },[])

    return (
        <div>
            <h3 className='mb-6 font-medium'>Payout History</h3>

            {/* Pending balance card */}
            <div className='border border-line bg-paper p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>PENDING BALANCE</p>
                    <p className='text-3xl font-medium'>{formatINR(pendingBalance)}</p>
                    <p className='text-xs text-ink-soft mt-2'>Next payout on the 1st of next month</p>
                </div>
                <div className='text-xs text-ink-soft sm:text-right'>
                    <p>Bank: HDFC Bank ····2847</p>
                    <p>UPI: vendor@hdfcbank</p>
                </div>
            </div>

            {/* Payout history table */}
            <div className='border border-line bg-paper'>
                <p className='text-sm font-medium p-4 border-b border-line'>Past payouts</p>
                <div>
                    <div className='hidden md:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                        <p>DATE</p>
                        <p>ORDERS</p>
                        <p>AMOUNT</p>
                        <p>UTR</p>
                        <p className='text-right'>STATUS</p>
                    </div>
                    {payouts.map((p) => (
                        <div key={p._id} className='grid grid-cols-[1.5fr_1fr] md:grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] py-3 px-4 text-sm border-b border-line last:border-b-0 gap-2'>
                            <p>{p.date}</p>
                            <p className='hidden md:block'>{p.orders}</p>
                            <p className='hidden md:block font-medium'>{formatINR(p.amount)}</p>
                            <p className='hidden md:block font-mono text-xs text-ink-soft self-center'>{p.utr}</p>
                            <p className='text-right'>
                                <span className='text-[10px] bg-green-600 text-paper px-2 py-1 rounded'>{p.status}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Payouts