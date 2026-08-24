import React from 'react'
import UserMenu from '../components/UserMenu'
import { IoClose } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const UserMenuMobile = () => {
  const navigate = useNavigate();

  return (
    <section className='bg-neutral-50 min-h-screen w-full flex flex-col animate-in slide-in-from-right duration-200'>
      
      {/* Top Mobile Header Sticky Bar */}
      <div className='bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm'>
        <h2 className='font-extrabold text-neutral-800 text-base tracking-tight'>
          Account Menu
        </h2>
        <button 
          onClick={() => navigate(-1)} 
          className='text-neutral-500 hover:text-neutral-800 p-1.5 hover:bg-neutral-100 rounded-xl transition-all active:scale-95 cursor-pointer'
          aria-label="Close Menu"
        >
          <IoClose size={22} />
        </button>
      </div>

      {/* Core Component Layout View Wrapper */}
      <div className='flex-1 overflow-y-auto p-4 max-w-md w-full mx-auto pb-12'>
        <div className='bg-white border border-neutral-100 rounded-2xl p-2 shadow-sm'>
          <UserMenu />
        </div>
      </div>
      
    </section>
  )
}

export default UserMenuMobile