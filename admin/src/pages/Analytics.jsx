import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatINR } from '../utils/money'

const Analytics = () => {

    const [stats, setStats] = useState({
        totalSales: 0,
        activeVendors: 0,
        ordersThisWeek: 0,
        pendingApprovals: 0,
    });
    const [revenueChart, setRevenueChart] = useState([]);
    const [topVendors, setTopVendors] = useState([]);
    const [categoryShare, setCategoryShare] = useState([]);

    const fetchAnalytics = async () => {
        // Backend wiring later - all currency in paise (integer)
        setStats({
            totalSales: 184500000,      // ₹18,45,000
            activeVendors: 47,
            ordersThisWeek: 312,
            pendingApprovals: 3,
        });

        setRevenueChart([
            { day: 'Mon', revenue: 21200000 },
            { day: 'Tue', revenue: 18500000 },
            { day: 'Wed', revenue: 28400000 },
            { day: 'Thu', revenue: 24100000 },
            { day: 'Fri', revenue: 32500000 },
            { day: 'Sat', revenue: 38200000 },
            { day: 'Sun', revenue: 21600000 },
        ]);

        setTopVendors([
            { _id: 'v1', name: 'Tantuja Studio', city: 'Bengaluru', sales: 24850000, orders: 42, score: 92 },
            { _id: 'v2', name: 'Modi Metals', city: 'Moradabad', sales: 18920000, orders: 28, score: 88 },
            { _id: 'v3', name: 'Indigo House', city: 'Ahmedabad', sales: 15240000, orders: 35, score: 85 },
            { _id: 'v4', name: 'Bagru Prints', city: 'Jaipur', sales: 13680000, orders: 48, score: 79 },
            { _id: 'v5', name: 'Flax & Folk', city: 'Coimbatore', sales: 11420000, orders: 31, score: 73 },
        ]);

        setCategoryShare([
            { name: 'Clothing', value: 42, fill: '#2D4A8A' },
            { name: 'Home', value: 28, fill: '#E0B43A' },
            { name: 'Accessories', value: 18, fill: '#9E3027' },
            { name: 'Stationery', value: 12, fill: '#5C5A56' },
        ]);
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-mustard';
        return 'bg-brick';
    }

    useEffect(()=>{
        fetchAnalytics();
    },[])

    return (
        <div>
            <h3 className='mb-6 font-medium'>Platform Analytics</h3>

            {/* Stat cards */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>TOTAL SALES</p>
                    <p className='text-2xl font-medium'>{formatINR(stats.totalSales)}</p>
                    <p className='text-xs text-ink-soft mt-2'>All-time platform revenue</p>
                </div>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>ACTIVE VENDORS</p>
                    <p className='text-2xl font-medium'>{stats.activeVendors}</p>
                    <p className='text-xs text-ink-soft mt-2'>Listing this month</p>
                </div>

                <div className='border border-line p-5 bg-mustard'>
                    <p className='text-xs text-ink tracking-wider mb-2'>ORDERS</p>
                    <p className='text-2xl font-medium text-ink'>{stats.ordersThisWeek}</p>
                    <p className='text-xs text-ink mt-2'>This week</p>
                </div>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>PENDING APPROVALS</p>
                    <p className='text-2xl font-medium text-brick'>{stats.pendingApprovals}</p>
                    <p className='text-xs text-ink-soft mt-2'>Vendor applications</p>
                </div>

            </div>

            {/* Charts row */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8'>

                {/* Revenue chart - 2/3 width on desktop */}
                <div className='lg:col-span-2 border border-line p-6 bg-paper'>
                    <p className='text-sm font-medium mb-4'>Revenue — last 7 days</p>
                    <ResponsiveContainer width='100%' height={280}>
                        <LineChart data={revenueChart}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#E8E2D3'/>
                            <XAxis dataKey='day' stroke='#5C5A56' style={{ fontSize: '12px' }}/>
                            <YAxis stroke='#5C5A56' style={{ fontSize: '12px' }} tickFormatter={(v)=>`₹${(v/100000).toFixed(0)}k`}/>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#FDFAF1' }}
                                labelStyle={{ color: '#FDFAF1' }}
                                formatter={(value) => [formatINR(value), 'Revenue']}
                            />
                            <Line type='monotone' dataKey='revenue' stroke='#2D4A8A' strokeWidth={2.5} dot={{ fill: '#2D4A8A', r: 4 }} activeDot={{ r: 6, fill: '#E0B43A' }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category pie chart - 1/3 width */}
                <div className='border border-line p-6 bg-paper'>
                    <p className='text-sm font-medium mb-4'>Sales by category</p>
                    <ResponsiveContainer width='100%' height={280}>
                        <PieChart>
                            <Pie data={categoryShare} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={50} outerRadius={80} paddingAngle={2}>
                                {categoryShare.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill}/>
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#FDFAF1' }}
                                formatter={(value, name) => [`${value}%`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Top vendors table */}
            <div className='border border-line bg-paper'>
                <p className='text-sm font-medium p-4 border-b border-line'>Top vendors by revenue</p>
                <div>
                    <div className='hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                        <p>VENDOR</p>
                        <p>ORDERS</p>
                        <p>REVENUE</p>
                        <p>SCORE</p>
                        <p className='text-right'>RANK</p>
                    </div>
                    {topVendors.map((v, i) => (
                        <div key={v._id} className='grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-3 px-4 text-sm border-b border-line last:border-b-0 gap-2'>
                            <div>
                                <p className='font-medium'>{v.name}</p>
                                <p className='text-xs text-ink-soft'>📍 {v.city}</p>
                            </div>
                            <p>{v.orders}</p>
                            <p className='font-medium'>{formatINR(v.sales)}</p>
                            <div className='flex items-center gap-2'>
                                <span className={`text-[10px] text-paper px-2 py-0.5 rounded ${getScoreColor(v.score)}`}>{v.score}</span>
                            </div>
                            <p className='text-right text-ink-soft'>#{i+1}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Analytics