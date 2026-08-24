import React from 'react'
import { IoClose } from 'react-icons/io5'

const ViewImage = ({url, close}) => {
  return (
    <div className='fixed inset-0 bg-neutral-950/90 flex flex-col justify-center items-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
        
        {/* Close Button Container - Positioned at Top Right of Screen */}
        <div className='absolute top-4 right-4 z-52'>
            <button 
              type="button"
              onClick={close} 
              className='p-2 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-neutral-800/50 shadow-md active:scale-95 cursor-pointer'
              title="Close Image"
            >
                <IoClose size={24}/>
            </button>
        </div>

        {/* Image Display Wrapper */}
        <div className='w-full max-w-4xl max-h-[85vh] flex items-center justify-center animate-in zoom-in-95 duration-200 select-none'>
            <img 
                src={url}
                alt='preview full screen'
                className='max-w-full max-h-[85vh] object-contain rounded-lg drop-shadow-2xl transition-transform selection:bg-transparent'
            />
        </div>
        
    </div>
  )
}

export default ViewImage