import React, { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'

import { API } from '../api/config.js'

const Login = () => {
    const navigate = useNavigate();
    const { setToken } = useContext(ShopContext);

    const [currentState, setCurrentState] = useState('Login');
    const [name, setName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [pendingUserId, setPendingUserId] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [phoneCode, setPhoneCode] = useState('');

    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (currentState === 'Sign Up') {
                const newErrors = {};
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    newErrors.email = 'Enter a valid email address';
                if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, '')))
                    newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
                if (password.length < 8)
                    newErrors.password = 'Password must be at least 8 characters';
                if (password !== confirmPassword)
                    newErrors.confirmPassword = 'Passwords do not match';
                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    setLoading(false);
                    return;
                }
                setErrors({});
                const res = await axios.post(`${API}/auth/register`, { name, userName, email, phone, password });
                if (res.data.requiresVerification) {
                    setPendingUserId(res.data.userId);
                    setCurrentState('verify-registration');
                    toast.success('Codes sent to your email and phone');
                } else {
                    toast.success('Account created! Please sign in.');
                    setCurrentState('Login');
                }

            } else if (currentState === 'Login') {
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
                    setCurrentState('verify-2fa');
                    toast.info('Check your email or phone for a verification code');
                } else {
                    localStorage.setItem('token', res.data.accessToken);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                    setToken(res.data.accessToken);
                    navigate('/');
                }

            } else if (currentState === 'verify-registration') {
                await axios.post(`${API}/auth/register/verify-otp`, {
                    userId: pendingUserId,
                    emailCode,
                    phoneCode,
                });
                toast.success('Account verified! Please sign in.');
                setCurrentState('Login');

            } else if (currentState === 'verify-2fa') {
                const res = await axios.post(`${API}/auth/login/verify-2fa`, {
                    twoFactorToken,
                    code: twoFactorCode,
                });
                localStorage.setItem('token', res.data.accessToken);
                localStorage.setItem('refreshToken', res.data.refreshToken);
                setToken(res.data.accessToken);
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        try {
            await axios.post(`${API}/auth/register/resend-otp`, { userId: pendingUserId });
            toast.success('Codes resent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not resend codes');
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-ink'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='font-display text-3xl'>
                    {currentState === 'Login' && 'Login'}
                    {currentState === 'Sign Up' && 'Sign Up'}
                    {currentState === 'verify-registration' && 'Verify Account'}
                    {currentState === 'verify-2fa' && 'Two-Factor Auth'}
                </p>
                <hr className='border-none h-[1.5px] w-8 bg-ink'/>
            </div>

            {currentState === 'Sign Up' && (
                <>
                    <input onChange={(e)=>setName(e.target.value)} value={name} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Name' required/>
                    <input onChange={(e)=>setUserName(e.target.value)} value={userName} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Username' required/>
                    <div className='w-full'>
                        <input onChange={(e)=>setPhone(e.target.value)} value={phone} type='tel' className={`w-full px-3 py-2 border outline-none focus:border-navy ${errors.phone ? 'border-brick' : 'border-line'}`} placeholder='Phone (10 digits, e.g. 9876543210)' required/>
                        {errors.phone && <p className='text-xs text-brick mt-1'>{errors.phone}</p>}
                    </div>
                    <div className='w-full'>
                        <input onChange={(e)=>setEmail(e.target.value)} value={email} type='email' className={`w-full px-3 py-2 border outline-none focus:border-navy ${errors.email ? 'border-brick' : 'border-line'}`} placeholder='Email' required/>
                        {errors.email && <p className='text-xs text-brick mt-1'>{errors.email}</p>}
                    </div>
                </>
            )}

            {currentState === 'Login' && (
                <input onChange={(e)=>setIdentifier(e.target.value)} value={identifier} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Email, username or phone' required/>
            )}

            {(currentState === 'Login' || currentState === 'Sign Up') && (
                <div className='w-full'>
                    <input onChange={(e)=>setPassword(e.target.value)} value={password} type='password' className={`w-full px-3 py-2 border outline-none focus:border-navy ${errors.password ? 'border-brick' : 'border-line'}`} placeholder='Password' required/>
                    {errors.password && <p className='text-xs text-brick mt-1'>{errors.password}</p>}
                </div>
            )}

            {currentState === 'Sign Up' && (
                <div className='w-full'>
                    <input onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword} type='password' className={`w-full px-3 py-2 border outline-none focus:border-navy ${errors.confirmPassword ? 'border-brick' : 'border-line'}`} placeholder='Confirm password' required/>
                    {errors.confirmPassword && <p className='text-xs text-brick mt-1'>{errors.confirmPassword}</p>}
                </div>
            )}

            {currentState === 'verify-registration' && (
                <>
                    <p className='text-sm text-ink-soft text-center'>Enter the 6-digit codes sent to your email and phone.</p>
                    <input onChange={(e)=>setEmailCode(e.target.value)} value={emailCode} type='text' inputMode='numeric' maxLength={6} className='w-full px-3 py-2 border border-line outline-none focus:border-navy text-center tracking-widest' placeholder='Email code' required/>
                    <input onChange={(e)=>setPhoneCode(e.target.value)} value={phoneCode} type='text' inputMode='numeric' maxLength={6} className='w-full px-3 py-2 border border-line outline-none focus:border-navy text-center tracking-widest' placeholder='Phone code' required/>
                    <button type='button' onClick={resendOtp} className='text-sm text-ink-soft hover:text-ink underline'>Resend codes</button>
                </>
            )}

            {currentState === 'verify-2fa' && (
                <>
                    <p className='text-sm text-ink-soft text-center'>Enter the 6-digit code sent to you.</p>
                    <input onChange={(e)=>setTwoFactorCode(e.target.value)} value={twoFactorCode} type='text' inputMode='numeric' maxLength={6} className='w-full px-3 py-2 border border-line outline-none focus:border-navy text-center tracking-widest' placeholder='Verification code' required/>
                </>
            )}

            {(currentState === 'Login' || currentState === 'Sign Up') && (
                <div className='w-full flex justify-between text-sm mt-[-8px] text-ink-soft'>
                    <p className='cursor-pointer hover:text-ink'>Forgot password?</p>
                    {currentState === 'Login'
                        ? <p onClick={()=>{ setCurrentState('Sign Up'); setErrors({}); }} className='cursor-pointer hover:text-ink'>Create account</p>
                        : <p onClick={()=>{ setCurrentState('Login'); setErrors({}); }} className='cursor-pointer hover:text-ink'>Login here</p>
                    }
                </div>
            )}

            <button disabled={loading} className='bg-ink text-paper font-light px-8 py-2 mt-4 w-full hover:bg-navy transition-colors disabled:opacity-50'>
                {loading ? '...' : (
                    currentState === 'Login' ? 'Sign In' :
                    currentState === 'Sign Up' ? 'Sign Up' :
                    'Verify'
                )}
            </button>

            {(currentState === 'verify-registration' || currentState === 'verify-2fa') && (
                <p onClick={()=>setCurrentState('Login')} className='text-sm text-ink-soft cursor-pointer hover:text-ink'>Back to login</p>
            )}
        </form>
    );
};

export default Login
