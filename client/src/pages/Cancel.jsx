import React from 'react'
import { Link } from 'react-router-dom'
import { IoCloseCircleOutline } from "react-icons/io5";

const Cancel = () => {
  return (
    <div className='min-h-[70vh] w-full flex items-center justify-center p-4 bg-neutral-50/50'>
      <div className='w-full max-w-md bg-white border border-neutral-100 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center text-center gap-6 animate-in zoom-in-95 duration-150'>
          
          {/* Cancel Animated Icon Wrapper */}
          <div className='w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center rounded-full shadow-inner animate-bounce duration-1000'>
              <IoCloseCircleOutline size={36}/>
          </div>

          {/* Heading & Meta Message */}
          <div className='space-y-2'>
              <h2 className='text-rose-600 font-extrabold text-2xl tracking-tight'>
                Order Cancelled
              </h2>
              <p className='text-sm text-neutral-500 font-medium max-w-xs mx-auto leading-relaxed'>
                Your transaction was cancelled or couldn't be processed. No worries, money will be refunded if deducted.
              </p>
          </div>

          {/* Action Divider Line */}
          <div className='w-full h-[1px] bg-neutral-100' />

          {/* Home Redirection Trigger Button */}
          <Link 
            to="/" 
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] text-center"
          >
              Go To Home
          </Link>
          
      </div>
    </div>
  )
}

export default Cancel