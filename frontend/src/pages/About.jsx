import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>

        <div className='text-2xl text-center pt-8 border-t border-line'>
            <Title text1={'ABOUT'} text2={'US'}/>
        </div>

        <div className='my-10 flex flex-col md:flex-row gap-16'>
            <img className='w-full md:max-w-[450px]' src={assets.about_img} alt=""/>
            <div className='flex flex-col justify-center gap-6 md:w-2/4 text-ink-soft'>
                <p>VendorHub was built on a simple idea — the best products are often the closest ones. Every kurta, every lamp, every wallet sold here ships from a verified local vendor in your city or one nearby.</p>
                <p>We started by talking to small business owners across India who had great products but no way to reach customers online without paying enormous platform fees. VendorHub takes 5% commission per sale. That's it.</p>
                <b className='text-ink'>Our Mission</b>
                <p>Make it as easy to buy from the shop down the street as it is to buy from a warehouse halfway across the country.</p>
            </div>
        </div>

        <div className='text-xl py-4'>
            <Title text1={'WHY'} text2={'CHOOSE US'}/>
        </div>

        <div className='flex flex-col md:flex-row text-sm mb-20'>
            <div className='border border-line px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
                <b className='text-ink'>Verified Vendors:</b>
                <p className='text-ink-soft'>Every seller on VendorHub goes through manual verification before they can list. We check GSTIN, business address, and bank details.</p>
            </div>
            <div className='border border-line px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
                <b className='text-ink'>Fast Local Delivery:</b>
                <p className='text-ink-soft'>Products ship from within your city when possible. Most orders arrive in 24-48 hours, not a week later.</p>
            </div>
            <div className='border border-line px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
                <b className='text-ink'>Fair to Both Sides:</b>
                <p className='text-ink-soft'>Sellers keep 95% of the sale. Buyers pay the same price they'd pay anywhere else. Nobody loses.</p>
            </div>
        </div>

        <NewsletterBox/>

    </div>
  )
}

export default About