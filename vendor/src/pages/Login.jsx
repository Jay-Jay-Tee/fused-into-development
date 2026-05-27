import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/login`, { email, password });
            const { accessToken } = res.data;
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            if (payload.role === 'vendor') {
                localStorage.setItem('token', accessToken);
                navigate('/');
            } else if (payload.role === 'buyer') {
                toast.error('Your application is pending approval');
                navigate('/pending');
            } else {
                toast.error('Access denied');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            <div className='w-full max-w-md border border-line bg-paper p-8'>
                <p className='text-xs text-ink-soft tracking-wider mb-2'>VENDOR PORTAL</p>
                <h1 className='font-display text-3xl mb-8'>Sign in</h1>
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper'
                    />
                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-ink text-paper px-6 py-2 text-sm hover:bg-navy transition-colors disabled:opacity-50'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className='text-sm text-ink-soft mt-6'>
                    New vendor?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        className='text-ink underline cursor-pointer hover:text-navy'
                    >
                        Apply here
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
