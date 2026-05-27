import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (showTwoFactor) {
                const res = await axios.post(`${API}/auth/login/verify-2fa`, {
                    twoFactorToken,
                    code: twoFactorCode,
                });
                const { accessToken } = res.data;
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                if (payload.role === 'vendor') {
                    localStorage.setItem('token', accessToken);
                    navigate('/');
                } else {
                    toast.error('Access denied');
                }
                return;
            }

            const isEmail = identifier.includes('@');
            const isPhone = /^\+?\d{7,15}$/.test(identifier.replace(/\s/g, ''));
            const loginPayload = isEmail
                ? { email: identifier, password }
                : isPhone
                    ? { phone: identifier, password }
                    : { userName: identifier, password };

            const res = await axios.post(`${API}/auth/login`, loginPayload);

            if (res.data.twoFactorRequired) {
                setTwoFactorToken(res.data.twoFactorToken);
                setShowTwoFactor(true);
                toast.info('Check your email or phone for a verification code');
                return;
            }

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
                <h1 className='font-display text-3xl mb-8'>
                    {showTwoFactor ? 'Verification' : 'Sign in'}
                </h1>
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                    {showTwoFactor ? (
                        <>
                            <p className='text-sm text-ink-soft'>Enter the 6-digit code sent to you.</p>
                            <input
                                type='text'
                                inputMode='numeric'
                                maxLength={6}
                                placeholder='Verification code'
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                required
                                className='px-3 py-2 border border-line outline-none focus:border-navy bg-paper text-center tracking-widest'
                            />
                        </>
                    ) : (
                        <>
                            <input
                                type='text'
                                placeholder='Email, username or phone'
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
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
                        </>
                    )}
                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-ink text-paper px-6 py-2 text-sm hover:bg-navy transition-colors disabled:opacity-50'
                    >
                        {loading ? '...' : (showTwoFactor ? 'Verify' : 'Sign In')}
                    </button>
                </form>
                {showTwoFactor ? (
                    <p className='text-sm text-ink-soft mt-6 cursor-pointer hover:text-ink' onClick={() => setShowTwoFactor(false)}>
                        Back to login
                    </p>
                ) : (
                    <p className='text-sm text-ink-soft mt-6'>
                        New vendor?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            className='text-ink underline cursor-pointer hover:text-navy'
                        >
                            Apply here
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
