import React from 'react'
import useToastStore from '../store/toastStore'

const Toast = () => {
  const { visible, message, type } = useToastStore()

  if (!visible) return null

  //basic colour scheme might need to change based on overall look
  const backgroundColor =
    type === 'success'
      ? '#1cd861'
      : type === 'error'
      ? '#ef4444'
      : '#3b82f6'

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor,
        padding: '12px 20px',
        borderRadius: '10px',
        zIndex: 9999,
        color: 'white',
        fontWeight: '600',
        maxWidth: '90%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  )
}

export default Toast