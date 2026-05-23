import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>

        <div className='text-center text-2xl pt-10 border-t border-line'>
            <Title text1={'CONTACT'} text2={'US'}/>
        </div>

        <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
            <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt=""/>
            <div className='flex flex-col justify-center items-start gap-6'>
                <p className='font-semibold text-xl text-ink'>Our Office</p>
                <p className='text-ink-soft'>
                    VendorHub HQ<br/>
                    Sector 18, Cyber City<br/>
                    Gurugram, Haryana 122002<br/>
                    India
                </p>
                <p className='text-ink-soft'>
                    Phone: +91 98765 43210<br/>
                    Email: hello@vendorhub.in
                </p>
                <p className='font-semibold text-xl text-ink'>Sell on VendorHub</p>
                <p className='text-ink-soft'>Have a small business and want to reach customers in your city? We're onboarding vendors every week.</p>
                <button className='border border-ink px-8 py-4 text-sm hover:bg-ink hover:text-paper transition-colors'>
                    Become a Vendor
                </button>
            </div>
        </div>

        <NewsletterBox/>

    </div>
  )
}

export default Contact