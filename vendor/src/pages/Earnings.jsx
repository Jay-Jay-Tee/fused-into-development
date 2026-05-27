import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatINR } from '../utils/money'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Earnings = () => {

    const [stats, setStats] = useState({
        totalRevenue: 0,
        ordersThisWeek: 0,
        avgOrderValue: 0,
        bestDay: '',
    });
    const [chartData, setChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [commissionRates, setCommissionRates] = useState([]);
    const [platformDefault, setPlatformDefault] = useState(10);

    const fetchEarnings = async () => {
        try {
            const catRes = await axios.get(`${API}/categories`);
            const parents = catRes.data.filter(c => !c.parentCategory);
            setPlatformDefault(10);
            setCommissionRates(parents.map(c => ({ name: c.name, rate: c.commission })));
        } catch {
            // non-critical, leave empty
        }

        const mockChart = [
            { day: 'Mon', revenue: 240000 },
            { day: 'Tue', revenue: 180000 },
            { day: 'Wed', revenue: 320000 },
            { day: 'Thu', revenue: 210000 },
            { day: 'Fri', revenue: 450000 },
            { day: 'Sat', revenue: 620000 },
            { day: 'Sun', revenue: 380000 },
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
            { name: 'Cotton handloom kurta', units: 18, revenue: 2338200 },
            { name: 'Brass desk lamp', units: 11, revenue: 2748900 },
            { name: 'Leather wallet, slim', units: 9, revenue: 1619100 },
            { name: 'Khadi cotton shirt', units: 7, revenue: 1119300 },
            { name: 'Ceramic pour-over set', units: 5, revenue: 949500 },
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
                    <p className='text-2xl font-medium'>{formatINR(stats.totalRevenue)}</p>
                    <p className='text-xs text-ink-soft mt-2'>This week</p>
                </div>

                <div className='border border-line p-5 bg-paper'>
                    <p className='text-xs text-ink-soft tracking-wider mb-2'>ORDERS</p>
                    <p className='text-2xl font-medium'>{stats.ordersThisWeek}</p>
                    <p className='text-xs text-ink-soft mt-2'>This week</p>
                </div>

                <div className='border border-line p-5 bg-mustard'>
                    <p className='text-xs text-ink tracking-wider mb-2'>AVG ORDER VALUE</p>
                    <p className='text-2xl font-medium text-ink'>{formatINR(stats.avgOrderValue)}</p>
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
                <p className='text-sm font-medium mb-4'>Revenue  -  last 7 days</p>
                <ResponsiveContainer width='100%' height={280}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#E8E2D3'/>
                        <XAxis dataKey='day' stroke='#5C5A56' style={{ fontSize: '12px' }}/>
                        <YAxis stroke='#5C5A56' style={{ fontSize: '12px' }} tickFormatter={(v)=>`Rs. ${(v/1000).toFixed(0)}k`}/>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#FDFAF1' }}
                            labelStyle={{ color: '#FDFAF1' }}
                            formatter={(value) => [formatINR(value), 'Revenue']}
                        />
                        <Line type='monotone' dataKey='revenue' stroke='#2D4A8A' strokeWidth={2.5} dot={{ fill: '#2D4A8A', r: 4 }} activeDot={{ r: 6, fill: '#E0B43A' }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top selling products bar chart */}
            <div className='border border-line p-6 mb-8 bg-paper'>
                <p className='text-sm font-medium mb-4'>Top selling products  -  units sold</p>
                <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={topProducts} layout='vertical' margin={{ left: 16, right: 16 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#E8E2D3' horizontal={false}/>
                        <XAxis type='number' stroke='#5C5A56' style={{ fontSize: '11px' }}/>
                        <YAxis type='category' dataKey='name' width={160} stroke='#5C5A56' style={{ fontSize: '11px' }} tick={{ width: 155 }}/>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', color: '#FDFAF1' }}
                            formatter={(value, name) => [value, name === 'units' ? 'Units sold' : 'Revenue']}
                        />
                        <Bar dataKey='units' radius={[0, 3, 3, 0]}>
                            {topProducts.map((_, i) => (
                                <Cell key={i} fill={i === 0 ? '#2D4A8A' : '#E0B43A'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top selling products table */}
            <div className='border border-line bg-paper mb-8'>
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
                            <p className='text-right font-medium'>{formatINR(p.revenue)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commission rates by category */}
            {commissionRates.length > 0 && (
                <div className='border border-line bg-paper'>
                    <div className='p-4 border-b border-line'>
                        <p className='text-sm font-medium'>Commission rates applied to your sales</p>
                        <p className='text-xs text-ink-soft mt-1'>Platform default: {platformDefault}%. Categories below override this.</p>
                    </div>
                    <div>
                        <div className='hidden md:grid grid-cols-[2fr_1fr] py-2 px-4 text-xs text-ink-soft tracking-wider border-b border-line'>
                            <p>CATEGORY</p>
                            <p className='text-right'>RATE</p>
                        </div>
                        {commissionRates.map((r, i) => (
                            <div key={i} className='grid grid-cols-[2fr_1fr] py-3 px-4 text-sm border-b border-line last:border-b-0'>
                                <p>{r.name}</p>
                                <p className='text-right font-medium'>
                                    {r.rate !== null && r.rate !== undefined
                                        ? `${r.rate}%`
                                        : <span className='text-ink-soft'>Default ({platformDefault}%)</span>
                                    }
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Earnings