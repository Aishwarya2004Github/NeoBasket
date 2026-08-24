import React from 'react'
import { IoClose } from "react-icons/io5";

const CofirmBox = ({cancel, confirm, close}) => {
  return (
    <div className='fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex justify-center items-center animate-fadeIn'>
      
      {/* Cyberpunk Danger Modal Box with Deep Glow Aura */}
      <div className='bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.15)] relative overflow-hidden transform scale-95 animate-scaleUp'>
            
            {/* Top Warning Crimson Neon Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500" />

            {/* Header Block */}
            <div className='flex justify-between items-center gap-3 border-b border-slate-800/60 pb-3'>
                <h1 className='text-lg font-black bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent tracking-wide uppercase flex items-center gap-2'>
                    ⚠️ Permanent Delete
                </h1>
                <button 
                    onClick={close} 
                    className='text-slate-400 hover:text-rose-500 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 active:scale-90'
                >
                    <IoClose size={22} />
                </button>
            </div>

            {/* Warning Descriptive Alert */}
            <p className='my-6 text-sm font-medium text-slate-300 tracking-wide leading-relaxed bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5'>
                Are you absolutely sure you want to <span className="text-rose-400 font-bold underline decoration-rose-500/50">permanently delete</span> this item? This operation cannot be undone.
            </p>

            {/* Action Group Trigger Grid */}
            <div className='w-full sm:w-fit sm:ml-auto flex items-center justify-end gap-3 font-black uppercase tracking-wider text-xs'>
                
                {/* Abort Button */}
                <button 
                    onClick={cancel} 
                    className='px-5 py-2.5 bg-slate-950 text-slate-400 border border-slate-800 rounded-xl hover:text-white hover:border-slate-700 transition-all duration-200 active:scale-95 w-full sm:w-auto text-center'
                >
                    Cancel
                </button>
                
                {/* Destructive Confirm Action */}
                <button 
                    onClick={confirm} 
                    className='px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] hover:brightness-110 transition-all duration-300 active:scale-95 w-full sm:w-auto text-center'
                >
                    Confirm
                </button>
                
            </div>
      </div>
    </div>
  )
}

export default CofirmBox