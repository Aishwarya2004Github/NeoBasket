import React from 'react'

const CardLoading = () => {
  return (
    /* Cyberpunk Theme Skeleton Card Wrapper with Shimmer Base */
    <div className='border border-slate-800/60 py-3 px-3 lg:p-4 grid gap-2 lg:gap-3.5 min-w-[150px] lg:min-w-[220px] rounded-2xl bg-slate-900/80 shadow-md relative overflow-hidden animate-pulse'>
      
      {/* Subtle Neon Backdrop Shimmer Indicator */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

      {/* Product Image Placeholder Box */}
      <div className='min-h-[110px] lg:min-h-[140px] bg-slate-950/60 border border-slate-800/40 rounded-xl'>
      </div>
      
      {/* Fast Delivery / Tag Placeholder */}
      <div className='h-4 bg-slate-800 rounded-md w-20 opacity-80'>
      </div>
      
      {/* Product Title Line 1 Placeholder */}
      <div className='h-5 bg-slate-800 rounded-md w-full'>
      </div>
      
      {/* Product Weight / Unit Placeholder */}
      <div className='h-4 bg-slate-800 rounded-md w-14 opacity-60'>
      </div>

      {/* Price & Add Button Row Placeholder */}
      <div className='flex items-center justify-between gap-3 mt-1'>
        {/* Price Tag */}
        <div className='h-6 bg-slate-800 rounded-md w-16'>
        </div>
        
        {/* CTA Button Block */}
        <div className='h-8 bg-slate-800/80 border border-slate-700/30 rounded-xl w-20'>
        </div>
      </div>

    </div>
  )
}

export default CardLoading