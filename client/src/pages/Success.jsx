import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Success = () => {
  const location = useLocation()
    
  console.log("location", location)  

  return (
    <div className='w-full min-h-[75vh] flex items-center justify-center px-4 bg-neutral-50/50 animate-in fade-in duration-200'>
      <div className='w-full max-w-md bg-white border border-neutral-100 p-6 lg:p-8 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center gap-6'>
        
        {/* Success Animated Pulse Ring Badge */}
        <div className='w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner relative'>
          <span className='absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping' />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={3} 
            stroke="currentColor" 
            className="w-7 h-7 relative z-10"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Message Info Text Box */}
        <div className='space-y-1.5'>
          <h2 className='text-xl lg:text-2xl font-extrabold text-neutral-800 tracking-tight'>
            {Boolean(location?.state?.text) ? location?.state?.text : "Payment"} Successful!
          </h2>
          <p className='text-xs text-neutral-400 font-medium max-w-xs mx-auto leading-relaxed'>
            Your transaction was completed smoothly. Thank you for your order!
          </p>
        </div>

        {/* Divider line style */}
        <div className='w-full border-t border-neutral-100 my-1' />

        {/* Call to action Navigation Route Button */}
        <Link 
          to="/" 
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-md shadow-neutral-900/10 active:scale-[0.99] tracking-wide block text-center"
        >
          Go To Home
        </Link>
      </div>
    </div>
  )
}

export default Success