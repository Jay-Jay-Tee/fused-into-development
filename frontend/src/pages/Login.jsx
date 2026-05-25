import React, { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = () => {
    const navigate = useNavigate();
    const { setToken } = useContext(ShopContext);
    const [currentState, setCurrentState] = useState('Login');
    const [name, setName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (currentState === 'Sign Up') {
                await axios.post(`${API}/auth/register`, { name, userName, email, phone, password });
                toast.success('Account created! Please sign in.');
                setCurrentState('Login');
            } else {
                const res = await axios.post(`${API}/auth/login`, { email, password });
                const { accessToken } = res.data;
                localStorage.setItem('token', accessToken);
                setToken(accessToken);
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-ink'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='font-display text-3xl'>{currentState}</p>
                <hr className='border-none h-[1.5px] w-8 bg-ink'/>
            </div>
            {currentState === 'Login' ? null : (
                <>
                    <input onChange={(e)=>setName(e.target.value)} value={name} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Name' required/>
                    <input onChange={(e)=>setUserName(e.target.value)} value={userName} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Username' required/>
                    <input onChange={(e)=>setPhone(e.target.value)} value={phone} type='tel' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Phone' required/>
                </>
            )}
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type='email' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Email' required/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type='password' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Password' required/>
            <div className='w-full flex justify-between text-sm mt-[-8px] text-ink-soft'>
                <p className='cursor-pointer hover:text-ink'>Forgot password?</p>
                {currentState === 'Login'
                    ? <p onClick={()=>setCurrentState('Sign Up')} className='cursor-pointer hover:text-ink'>Create account</p>
                    : <p onClick={()=>setCurrentState('Login')} className='cursor-pointer hover:text-ink'>Login here</p>
                }
            </div>
            <button disabled={loading} className='bg-ink text-paper font-light px-8 py-2 mt-4 w-full hover:bg-navy transition-colors disabled:opacity-50'>
                {loading ? '...' : (currentState === 'Login' ? 'Sign In' : 'Sign Up')}
            </button>
        </form>
    )
}

export default Login
