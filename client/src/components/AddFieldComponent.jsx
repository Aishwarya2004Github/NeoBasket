import React from 'react'
import { IoClose } from "react-icons/io5";

const AddFieldComponent = ({close, value, onChange, submit}) => {
  return (
   <section className='fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fadeIn'>
        
        {/* Cyberpunk Modal Box with Deep Glow */}
        <div className='bg-slate-900 border border-slate-800/80 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden transform scale-95 animate-scaleUp'>
            
            {/* Top Multi-Color Neon Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600" />
            
            {/* Header section */}
            <div className='flex items-center justify-between gap-3 border-b border-slate-800/60 pb-3'>
                <h1 className='text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-wide uppercase'>
                    🛠️ Add New Field
                </h1>
                <button 
                    onClick={close}
                    className='text-slate-400 hover:text-pink-500 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 active:scale-90'
                >
                    <IoClose size={22}/>
                </button>
            </div>

            {/* Neon Glowing Field Input */}
            <div className='my-5 grid gap-1.5'>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field Name</label>
                <input
                     className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-3 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                     placeholder='e.g., Brand, Capacity, Material...'
                     value={value}
                     onChange={onChange}
                />
            </div>

            {/* Action Submit Button */}
            <button
                onClick={submit}
                disabled={!value?.trim()}
                className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-lg ${
                    value?.trim()
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] hover:brightness-110 active:scale-98"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800/50"
                }`}
            >
                Create Field
            </button>
        </div>
   </section>
  )
}

export default AddFieldComponent