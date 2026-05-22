import React from 'react'
const Title = ({text1,text2})=>{
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
        <p className='text-ink-soft font-display text-2xl md:text-3xl'>{text1} <span className='text-ink'>{text2}</span></p>
        <p className='w-8 md:w-12 h-[2px] bg-mustard'></p>
    </div>
  )
}
export default Title