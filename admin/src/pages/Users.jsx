import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ROLES = ['', 'buyer', 'vendor', 'admin']
const BANNED = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'false' },
    { label: 'Banned', value: 'true' },
]

const rolePill = (role) => {
    const map = {
        admin:  'bg-navy text-paper',
        vendor: 'bg-mustard text-ink',
        buyer:  'bg-line text-ink',
    }
    return `px-2 py-0.5 text-xs rounded-sm font-medium ${map[role] || 'bg-line text-ink'}`
}

const Users = () => {
    const [users, setUsers]       = useState([])
    const [role, setRole]         = useState('')
    const [banned, setBanned]     = useState('')
    const [page, setPage]         = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1 })
    const [banning, setBanning]   = useState(null)

    const fetchUsers = async (p = page) => {
        const token = localStorage.getItem('token')
        try {
            const params = { page: p, limit: 15 }
            if (role)   params.role     = role
            if (banned) params.isBanned = banned
            const res = await axios.get(`${API}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            })
            setUsers(res.data.users)
            setPagination(res.data.pagination)
        } catch {
            toast.error('Failed to load users')
        }
    }

    const toggleBan = async (user) => {
        const token = localStorage.getItem('token')
        setBanning(user._id)
        try {
            const ban = !user.isBanned
            await axios.put(`${API}/admin/users/${user._id}/ban`, { ban }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isBanned: ban } : u))
            toast.success(ban ? 'User banned' : 'User unbanned')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed')
        } finally {
            setBanning(null)
        }
    }

    useEffect(() => { fetchUsers(1); setPage(1) }, [role, banned])
    useEffect(() => { fetchUsers(page) }, [page])

    const handleFilter = () => { fetchUsers(1); setPage(1) }

    return (
        <div>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='font-medium'>Users</h3>
                <p className='text-sm text-ink-soft'>{pagination.total} total</p>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-3 mb-6'>
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className='border border-line bg-paper text-sm px-3 py-2 outline-none focus:border-navy'
                >
                    <option value=''>All roles</option>
                    {ROLES.filter(Boolean).map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                </select>

                <select
                    value={banned}
                    onChange={e => setBanned(e.target.value)}
                    className='border border-line bg-paper text-sm px-3 py-2 outline-none focus:border-navy'
                >
                    {BANNED.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className='border border-line bg-paper'>
                <div className='hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                    <p>NAME</p>
                    <p>EMAIL</p>
                    <p>ROLE</p>
                    <p>JOINED</p>
                    <p className='text-right'>ACTION</p>
                </div>

                {users.length === 0 && (
                    <div className='text-center py-20 text-ink-soft text-sm'>
                        No users found.
                    </div>
                )}

                {users.map(u => (
                    <div
                        key={u._id}
                        className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-3 px-4 text-sm border-b border-line last:border-b-0 ${u.isBanned ? 'opacity-50' : ''}`}
                    >
                        <div>
                            <p className='font-medium'>{u.name}</p>
                            <p className='text-xs text-ink-soft'>@{u.userName}</p>
                        </div>
                        <p className='text-ink-soft truncate'>{u.email}</p>
                        <p><span className={rolePill(u.role)}>{u.role}</span></p>
                        <p className='text-ink-soft text-xs'>
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <div className='flex justify-end'>
                            {u.role !== 'admin' && (
                                <button
                                    onClick={() => toggleBan(u)}
                                    disabled={banning === u._id}
                                    className={`px-3 py-1 text-xs border transition-colors ${
                                        u.isBanned
                                            ? 'border-navy text-navy hover:bg-navy hover:text-paper'
                                            : 'border-brick text-brick hover:bg-brick hover:text-paper'
                                    } disabled:opacity-40`}
                                >
                                    {banning === u._id ? '...' : u.isBanned ? 'Unban' : 'Ban'}
                                </button>
                            )}
                        </div>
                    </div>
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

export default Users
