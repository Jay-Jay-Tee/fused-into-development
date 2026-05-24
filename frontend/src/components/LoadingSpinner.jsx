import React from 'react'

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className='flex flex-col items-center justify-center p-5'>
      <div className='w-8 h-8 border-2 border-line border-t-navy rounded-full animate-spin'></div>
      <p className='mt-3 text-sm text-ink-soft'>{text}</p>
    </div>
  )
}

export default LoadingSpinner