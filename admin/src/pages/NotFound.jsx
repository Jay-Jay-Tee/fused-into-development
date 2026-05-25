import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center'>
            <p className='font-display text-6xl text-brick mb-4'>404</p>
            <p className='text-lg mb-2'>Page not found</p>
            <p className='text-sm text-ink-soft mb-6 max-w-sm'>
                This page doesn't exist or you don't have access to it.
            </p>
            <button onClick={()=>navigate('/analytics')} className='bg-ink text-paper px-6 py-3 text-sm hover:bg-navy transition-colors'>
                Back to dashboard
            </button>
        </div>
    )
}

export default NotFound