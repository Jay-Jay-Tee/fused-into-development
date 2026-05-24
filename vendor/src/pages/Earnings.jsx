import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const Earnings = () => {

    const [stats, setStats] = useState({
        totalRevenue: 0,
        ordersThisWeek: 0,
        avgOrderValue: 0,
        bestDay: '',
    });
    const [chartData, setChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const fetchEarnings = async () => {
        // Backend wiring later
        const mockChart = [
            { day: 'Mon', revenue: 2400 },
            { day: 'Tue', revenue: 1800 },
            { day: 'Wed', revenue: 3200 },
            { day: 'Thu', revenue: 2100 },
            { day: 'Fri', revenue: 4500 },
            { day: 'Sat', revenue: 6200 },
            { day: 'Sun', revenue: 3800 },
        ];
        const total = mockChart.reduce((sum, d) => sum + d.revenue, 0);
        const orders = 47;
        const best = mockChart.reduce((max, d) => d.revenue > max.revenue ? d : max, mockChart[0]);

        setStats({
            totalRevenue: total,
            ordersThisWeek: orders,
            avgOrderValue: Math.floor(total / orders),
            bestDay: best.day,
        });
        setChartData(mockChart);
        setTopProducts([
            { name: 'Cotton handloom kurta', units: 18, revenue: 23382 },
            { name: 'Brass desk lamp', units: 11, revenue: 27489 },
            { name: 'Leather wallet, slim', units: 9, revenue: 16191 },
            { name: 'Khadi cotton shirt', units: 7, revenue: 11193 },
            { name: 'Ceramic pour-over set', units: 5, revenue: 9495 },
        ]);
    }

    useEffect(()=>{
        fetchEarnings();
    },[])

    return (
        <div>
            <h3 className='mb-6 font-medium'>Earnings Dashboard</h3>

            {/* Stat cards */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>TOTAL REVENUE</p>
                    <p className='text-2xl font-medium'>₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                    <p className='text-xs text-ink-soft mt-2'>This week</p>
                </div>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>ORDERS</p>
                    <p className='text-2xl font-medium'>{stats.ordersThisWeek}</p>
                    <p className='text-xs text-ink-soft mt-2'>This week</p>
                </div>

                <div className='border border-line p-5 bg-mustard'>
                    <p className='text-xs text-ink tracking-wider mb-2'>AVG ORDER VALUE</p>
                    <p className='text-2xl font-medium text-ink'>₹{stats.avgOrderValue.toLocaleString('en-IN')}</p>
                    <p className='text-xs text-ink mt-2'>Per order</p>
                </div>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>BEST DAY</p>
                    <p className='text-2xl font-medium'>{stats.bestDay}</p>
                    <p className='text-xs text-ink-soft mt-2'>Peak revenue</p>
                </div>

            </div>

            {/* Revenue chart */}
            <div className='border border-line p-6 mb-8 bg-paper'>
                <p className='text-sm font-medium mb-4'>Revenue — last 7 days</p>
                <ResponsiveContainer width='100%' height={280}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#E8E2D3'/>
                        <XAxis dataKey='day' stroke='#5C5A56' style={{ fontSize: '12px' }}/>
                        <YAxis stroke='#5C5A56' style={{ fontSize: '12px' }}/>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#FDFAF1' }}
                            labelStyle={{ color: '#FDFAF1' }}
                            formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Line type='monotone' dataKey='revenue' stroke='#2D4A8A' strokeWidth={2.5} dot={{ fill: '#2D4A8A', r: 4 }} activeDot={{ r: 6, fill: '#E0B43A' }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top selling products */}
            <div className='border border-line bg-paper'>
                <p className='text-sm font-medium p-4 border-b border-line'>Top selling products</p>
                <div>
                    <div className='hidden md:grid grid-cols-[2fr_1fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                        <p>PRODUCT</p>
                        <p className='text-center'>UNITS SOLD</p>
                        <p className='text-right'>REVENUE</p>
                    </div>
                    {topProducts.map((p, i) => (
                        <div key={i} className='grid grid-cols-[2fr_1fr_1fr] py-3 px-4 text-sm border-b border-line last:border-b-0'>
                            <p>{p.name}</p>
                            <p className='text-center'>{p.units}</p>
                            <p className='text-right font-medium'>₹{p.revenue.toLocaleString('en-IN')}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Earnings