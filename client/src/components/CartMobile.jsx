import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'

const CartMobileLink = () => {
    const { totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem?.cart || [])

  return (
    <>
        {
            cartItem?.length > 0 && (
            /* Sticky Positioning Container with Bottom Safe Space padding */
            <div className='sticky bottom-6 p-4 z-40 w-full max-w-md mx-auto lg:hidden animate-bounceSubtle'>
                
                {/* Cyberpunk Glassmorphic Floating HUD link container */}
                <div className='bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-3 rounded-2xl text-slate-100 text-sm flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(244,63,94,0.2)] relative overflow-hidden'>
                    
                    {/* Glowing Left Neon Micro Border Decor */}
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-pink-500 via-rose-500 to-purple-600" />
                    
                    {/* Left Details Structure: Icon + Price Tracker */}
                    <div className='flex items-center gap-3 pl-1'>
                        {/* Interactive Dynamic Neon Pink Shopping Bag Aura */}
                        <div className='p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center animate-pulse'>
                            <FaCartShopping size={16}/>
                        </div>
                        
                        {/* Data Metrics */}
                        <div className='grid gap-0.5'>
                            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                                {totalQty} {totalQty === 1 ? 'Item' : 'Items'} Added
                            </p>
                            <p className='text-base font-black text-white tracking-wide'>
                                {DisplayPriceInRupees(totalPrice)}
                            </p>
                        </div>
                    </div>

                    {/* Right Action Trigger: Immersive Cyan Text Link */}
                    <Link 
                        to={"/cart"} 
                        className='flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-cyan-500/20 active:scale-95 transition-all duration-200 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
                    >
                        <span>View Cart</span>
                        <FaCaretRight size={14} className="text-cyan-400 animate-[translateX_1s_infinite]" />
                    </Link>

                </div>
            </div>
            )
        }
    </>
  )
}

export default CartMobileLink