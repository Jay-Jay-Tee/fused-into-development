import React from 'react'
const NewsletterBox = () => {
    const onSubmitHandler=(event)=>{
        event.preventDefault();
    }
    return (
        <div className='text-center py-16'>
            <p className='text-2xl font-medium text-ink'>Subscribe now & get 20% off</p>
            <p className='text-ink-soft mt-3'>
                Sign up for early access to new drops, vendor stories, and weekly deals.
            </p>
            <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-line pl-3'>
                <input className='w-full sm:flex-1 outline-none bg-transparent py-3' type="email" placeholder='Enter your email' required/>
                <button type='submit' className='bg-ink text-paper text-xs px-8 py-4 font-medium hover:bg-navy transition-colors'>SUBSCRIBE</button>
            </form>
        </div>
    )
}
export default NewsletterBox