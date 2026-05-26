import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatINR } from '../utils/money'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const STATUSES = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusPill = (status) => {
    const map = {
        pending:   'bg-line text-ink',
        confirmed: 'bg-mustard text-ink',
        shipped:   'bg-navy text-paper',
        delivered: 'bg-ink text-paper',
        cancelled: 'bg-brick text-paper',
    }
    return `px-2 py-0.5 text-xs rounded-sm font-medium ${map[status] || 'bg-line text-ink'}`
}

const Orders = () => {
    const [orders, setOrders]         = useState([])
    const [status, setStatus]         = useState('')
    const [from, setFrom]             = useState('')
    const [to, setTo]                 = useState('')
    const [page, setPage]             = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1 })
    const [expanded, setExpanded]     = useState(null)

    const fetchOrders = async (p = page) => {
        const token = localStorage.getItem('token')
        try {
            const params = { page: p, limit: 15 }
            if (status) params.status = status
            if (from)   params.from   = from
            if (to)     params.to     = to
            const res = await axios.get(`${API}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            })
            setOrders(res.data.orders)
            setPagination(res.data.pagination)
        } catch {
            toast.error('Failed to load orders')
        }
    }

    useEffect(() => { fetchOrders(1); setPage(1) }, [status])
    useEffect(() => { fetchOrders(page) }, [page])

    const handleApply = () => { fetchOrders(1); setPage(1) }

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>All Orders</h3>
                <p className='text-sm text-ink-soft'>{pagination.total} total</p>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-3 mb-6'>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className='border border-line bg-paper text-sm px-3 py-2 outline-none focus:border-navy'
                >
                    <option value=''>All statuses</option>
                    {STATUSES.filter(Boolean).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>

                <input
                    type='date'
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className='border border-line bg-paper text-sm px-3 py-2 outline-none focus:border-navy text-ink-soft'
                />
                <input
                    type='date'
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className='border border-line bg-paper text-sm px-3 py-2 outline-none focus:border-navy text-ink-soft'
                />
                <button
                    onClick={handleApply}
                    className='px-4 py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors'
                >
                    Apply
                </button>
                {(from || to) && (
                    <button
                        onClick={() => { setFrom(''); setTo(''); }}
                        className='px-4 py-2 border border-line text-sm hover:bg-line transition-colors'
                    >
                        Clear dates
                    </button>
                )}
            </div>

            {/* Table */}
            <div className='border border-line bg-paper'>
                <div className='hidden md:grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                    <p>ORDER ID</p>
                    <p>BUYER</p>
                    <p>TOTAL</p>
                    <p>STATUS</p>
                    <p className='text-right'>DATE</p>
                </div>

                {orders.length === 0 && (
                    <div className='text-center py-20 text-ink-soft text-sm'>
                        No orders found.
                    </div>
                )}

                {orders.map(o => (
                    <React.Fragment key={o._id}>
                        <button
                            onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                            className='w-full grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] items-center gap-2 py-3 px-4 text-sm border-b border-line last:border-b-0 text-left hover:bg-line transition-colors'
                        >
                            <p className='font-mono text-xs text-ink-soft truncate'>{o._id}</p>
                            <div>
                                <p className='font-medium'>{o.buyer?.name || '—'}</p>
                                <p className='text-xs text-ink-soft'>{o.buyer?.email || ''}</p>
                            </div>
                            <p className='font-medium'>{formatINR(o.totalAmount)}</p>
                            <p><span className={statusPill(o.orderStatus)}>{o.orderStatus}</span></p>
                            <p className='text-right text-ink-soft text-xs'>
                                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </button>

                        {/* Expanded items */}
                        {expanded === o._id && (
                            <div className='bg-line px-6 py-4 border-b border-line'>
                                <p className='text-xs text-ink-soft tracking-wider mb-3'>ITEMS</p>
                                <div className='flex flex-col gap-2'>
                                    {o.items.map((item, i) => (
                                        <div key={i} className='flex justify-between text-sm'>
                                            <p>{item.name} <span className='text-ink-soft'>× {item.quantity}</span></p>
                                            <p className='font-medium'>{formatINR(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                                {o.shippingAddress && (
                                    <div className='mt-3 pt-3 border-t border-line text-xs text-ink-soft'>
                                        <p className='tracking-wider mb-1'>SHIPPING</p>
                                        <p>{[o.shippingAddress.street, o.shippingAddress.city, o.shippingAddress.state, o.shippingAddress.pincode].filter(Boolean).join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className='flex items-center justify-between mt-4 text-sm'>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className='px-4 py-2 border border-line hover:bg-line disabled:opacity-40 transition-colors'
                    >
                        Previous
                    </button>
                    <p className='text-ink-soft'>Page {page} of {pagination.pages}</p>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className='px-4 py-2 border border-line hover:bg-line disabled:opacity-40 transition-colors'
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default Orders
