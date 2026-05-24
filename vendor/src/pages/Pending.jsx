import React from 'react'

const Pending = () => {

    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            <div className='w-full max-w-lg text-center'>

                <div className='w-20 h-20 mx-auto mb-6 bg-mustard flex items-center justify-center'>
                    <span className='text-4xl'>⏳</span>
                </div>

                <h1 className='font-display text-3xl md:text-4xl mb-4'>Application received</h1>

                <p className='text-ink-soft mb-8'>
                    Thanks for applying. Our team reviews new vendors within 24-48 hours. You'll get an email at the address you provided once we've made a decision.
                </p>

                <div className='border border-line bg-paper p-6 text-left mb-6'>
                    <p className='text-xs text-ink-soft tracking-wider mb-3'>WHAT HAPPENS NEXT</p>
                    <ol className='text-sm space-y-3'>
                        <li className='flex gap-3'>
                            <span className='text-mustard font-medium'>1.</span>
                            <span>We verify your bank details and shop information.</span>
                        </li>
                        <li className='flex gap-3'>
                            <span className='text-mustard font-medium'>2.</span>
                            <span>If approved, you'll get a welcome email with login instructions.</span>
                        </li>
                        <li className='flex gap-3'>
                            <span className='text-mustard font-medium'>3.</span>
                            <span>You can then log in and start listing products.</span>
                        </li>
                    </ol>
                </div>

                <p className='text-xs text-ink-soft'>
                    Questions? Email <a href='mailto:vendors@vendorhub.in' className='text-navy hover:underline'>vendors@vendorhub.in</a>
                </p>
            </div>
        </div>
    )
}

export default Pending