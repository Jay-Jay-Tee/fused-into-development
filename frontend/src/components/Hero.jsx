import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='relative py-10 md:py-16 overflow-hidden'>

        {/* Background dots - top right */}
        <div className='absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none'>
            <svg viewBox='0 0 160 160' className='w-full h-full'>
                <g fill='#2D4A8A'>
                    <circle cx='20' cy='20' r='2'/><circle cx='40' cy='10' r='1.5'/><circle cx='60' cy='30' r='2'/>
                    <circle cx='90' cy='15' r='1.5'/><circle cx='120' cy='25' r='2'/><circle cx='140' cy='40' r='1.5'/>
                    <circle cx='30' cy='50' r='1.5'/><circle cx='70' cy='60' r='2'/><circle cx='110' cy='55' r='1.5'/>
                    <circle cx='150' cy='70' r='2'/><circle cx='50' cy='90' r='1.5'/><circle cx='100' cy='100' r='2'/>
                </g>
            </svg>
        </div>

        {/* Background dots - bottom left */}
        <div className='absolute bottom-0 left-0 w-32 h-32 opacity-30 pointer-events-none'>
            <svg viewBox='0 0 128 128' className='w-full h-full'>
                <g fill='#2D4A8A'>
                    <circle cx='10' cy='40' r='1.5'/><circle cx='30' cy='60' r='2'/><circle cx='50' cy='80' r='1.5'/>
                    <circle cx='20' cy='90' r='2'/><circle cx='70' cy='100' r='1.5'/><circle cx='90' cy='110' r='2'/>
                </g>
            </svg>
        </div>

        {/* Hero card */}
        <div className='relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto'>

            {/* Left - main pitch */}
            <div className='bg-navy text-paper p-8 md:p-12 flex flex-col justify-between min-h-[400px]'>
                <div className='flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-mustard'></span>
                    <p className='font-medium text-xs tracking-widest'>NEW THIS WEEK</p>
                </div>
                <div>
                    <h1 className='font-display text-4xl md:text-5xl lg:text-6xl leading-none mb-4'>
                        UP TO <span className='text-mustard'>60%</span> OFF
                    </h1>
                    <p className='text-base md:text-lg mb-8 max-w-sm'>
                        Summer essentials from 500+ local vendors. Free delivery on orders above Rs. 499.
                    </p>
                    <Link to='/collection' className='inline-flex items-center gap-2 bg-mustard text-ink px-6 py-3 font-medium hover:bg-paper transition-colors'>
                        <span>Shop now</span>
                        <span>&gt;</span>
                    </Link>
                </div>
            </div>

            {/* Right - secondary tiles */}
            <div className='grid grid-rows-2 gap-6'>
                <Link to='/collection' className='bg-mustard p-6 md:p-8 flex flex-col justify-between group'>
                    <p className='font-display text-3xl md:text-4xl text-ink leading-none'>Crafts<br/>under Rs. 999</p>
                    <div className='flex items-center gap-2 text-ink'>
                        <p className='text-sm font-medium'>Explore</p>
                        <span className='group-hover:translate-x-1 transition-transform'>&gt;</span>
                    </div>
                </Link>
                <Link to='/collection' className='bg-brick text-paper p-6 md:p-8 flex flex-col justify-between group'>
                    <p className='font-display text-3xl md:text-4xl leading-none'>Festive<br/>edit</p>
                    <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium'>Shop the drop</p>
                        <span className='group-hover:translate-x-1 transition-transform'>&gt;</span>
                    </div>
                </Link>
            </div>

        </div>

    </div>
  )
}

export default Hero