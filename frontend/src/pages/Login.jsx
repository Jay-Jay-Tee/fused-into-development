import React, { useState } from 'react'
import { toast } from 'react-toastify'

const Login = () => {

    const [currentState, setCurrentState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        // Backend wiring later
        if (currentState === 'Sign Up'){
            toast.success('Account created');
        } else {
            toast.success('Logged in');
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-ink'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='font-display text-3xl'>{currentState}</p>
                <hr className='border-none h-[1.5px] w-8 bg-ink'/>
            </div>
            {currentState === 'Login' ? null : (
                <input onChange={(e)=>setName(e.target.value)} value={name} type='text' className='w-full px-3 py-2 border border-line outline-none focus:border-navy' placeholder='Name' required/>
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
            <button className='bg-ink text-paper font-light px-8 py-2 mt-4 w-full hover:bg-navy transition-colors'>
                {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>
        </form>
    )
}

export default Login