import React from 'react'
import DisplayCartItem from '../components/DisplayCartItem'

const CartMobile = () => {
  return (
    <div className='w-full min-h-screen bg-neutral-50/50 flex flex-col pb-24 lg:hidden animate-in fade-in duration-200'>
        {/* Mobile Cart Header */}
        <div className='bg-white px-4 py-3.5 sticky top-0 border-b border-neutral-100 shadow-sm z-10 flex items-center justify-between'>
            <h1 className='font-extrabold text-lg text-neutral-800 tracking-tight'>
                My Cart
            </h1>
            <span className='text-xs font-bold bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full'>
                Mobile View
            </span>
        </div>

        {/* Cart Item Display Component Wrapper */}
        <div className='w-full flex-1 p-2 sm:p-4'>
            <DisplayCartItem/>
        </div>
    </div>
  )
}

export default CartMobile