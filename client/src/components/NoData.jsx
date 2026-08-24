import React from 'react'
import noDataImage from '../assets/nothing here yet.webp'

const NoData = () => {
  return (
    <div className='flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in duration-300'>
      <img
        src={noDataImage}
        alt='no data'
        className='w-40 md:w-44 object-contain opacity-80 mix-blend-multiply' 
      />
      <p className='text-neutral-400 text-sm font-medium tracking-wide mt-2'>
        No Data Available
      </p>
    </div>
  )
}

export default NoData