import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'

const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
        const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
            const res = await axios.post(`${API}/auth/login`, { email, password });
            const { accessToken } = res.data;
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            if (payload.role !== 'admin') {
                toast.error('Access denied');
                return;
            }
            localStorage.setItem('token', accessToken);
            navigate('/analytics');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='min-h-screen bg-paper flex items-center justify-center'>
            <div className='w-full max-w-md border border-line p-8'>

                <div className='flex items-center gap-3 mb-8'>
                    <img src={assets.logo} className='w-24' alt=""/>
                    <span className='text-xs bg-brick text-paper px-2 py-0.5 tracking-wider'>ADMIN</span>
                </div>

                <p className='text-xl font-medium mb-1'>Sign in</p>
                <p className='text-sm text-ink-soft mb-6'>Admin access only</p>

                <form onSubmit={onSubmit} className='flex flex-col gap-4'>
                    <div>
                        <p className='text-sm mb-1'>Email</p>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                            placeholder='admin@vendorhub.com'
                        />
                    </div>
                    <div>
                        <p className='text-sm mb-1'>Password</p>
                        <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='w-full px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-sm'
                        />
                    </div>
                    <button type='submit' disabled={loading} className='w-full py-2 bg-ink text-paper text-sm hover:bg-navy transition-colors disabled:opacity-50 mt-2'>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

            </div>
        </div>
    )
}

export default Login

