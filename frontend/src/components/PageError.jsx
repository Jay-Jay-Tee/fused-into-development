import React from 'react'

const PageError = ({
  message = 'Something went wrong',
  onRetry,
}) => {
  return (
    <div className='flex flex-col items-center justify-center p-5 text-center'>
      <p className='text-lg font-semibold text-brick mb-2'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-2 bg-ink text-paper px-5 py-2 text-sm hover:bg-navy transition-colors'
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default PageError