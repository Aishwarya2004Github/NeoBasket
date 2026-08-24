import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";
import isAdmin from '../utils/isAdmin'

const UserMenu = ({close}) => {
   const user = useSelector((state)=> state.user)
   const dispatch = useDispatch()
   const navigate = useNavigate()

   const handleLogout = async()=>{
        try {
          const response = await Axios({
             ...SummaryApi.logout
          })
          console.log("logout",response)
          if(response.data.success){
            if(close){
              close()
            }
            dispatch(logout())
            localStorage.clear()
            toast.success(response.data.message)
            navigate("/")
          }
        } catch (error) {
          console.log(error)
          AxiosToastError(error)
        }
   }

   const handleClose = ()=>{
      if(close){
        close()
      }
   }
  return (
    <div className='w-full min-w-[230px] bg-white text-neutral-800 p-2 rounded-xl border border-neutral-100 shadow-lg'>
        {/* Profile Header */}
        <div className='px-3 py-2.5 bg-neutral-50/50 rounded-lg border border-neutral-100/50 mb-1.5'>
            <div className='text-xs font-bold uppercase tracking-wider text-neutral-400 mb-0.5'>My Account</div>
            <div className='text-sm flex items-center justify-between gap-2 group'>
              <span className='font-semibold text-neutral-800 max-w-[160px] text-ellipsis line-clamp-1 flex items-center gap-1.5' title={user.name || user.mobile}>
                {user.name || user.mobile} 
                {user.role === "ADMIN" && (
                  <span className='text-[11px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100'>Admin</span>
                )}
              </span>
              <Link 
                onClick={handleClose} 
                to={"/dashboard/profile"} 
                className='text-neutral-400 hover:text-primary-200 transition-colors p-1 hover:bg-white rounded shadow-sm border border-transparent hover:border-neutral-100'
              >
                <HiOutlineExternalLink size={15}/>
              </Link>
            </div>
        </div>

        <Divider/>

        {/* Menu Links Links Grid */}
        <div className='text-sm flex flex-col gap-0.5 mt-1.5'>
            {
              isAdmin(user.role) && (
                <>
                  <div className='text-[10px] font-bold text-neutral-400 px-3 pt-1 uppercase tracking-wider'>Admin Controls</div>
                  <Link onClick={handleClose} to={"/dashboard/category"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>Category</Link>
                  <Link onClick={handleClose} to={"/dashboard/subcategory"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>Sub Category</Link>
                  <Link onClick={handleClose} to={"/dashboard/upload-product"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>Upload Product</Link>
                  <Link onClick={handleClose} to={"/dashboard/product"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>Product</Link>
                  <div className='h-[1px] bg-neutral-100 my-1 mx-2' />
                </>
              )
            }

            {/* General Links */}
            <div className='text-[10px] font-bold text-neutral-400 px-3 pt-1 uppercase tracking-wider'>Settings</div>
            <Link onClick={handleClose} to={"/dashboard/myorders"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>My Orders</Link>
            <Link 
onClick={handleClose}
to={"/dashboard/order-tracking"}
className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'
>
Order Tracking
</Link>
{
isAdmin(user.role) && (
<>
<div className='text-[10px] font-bold text-neutral-400 px-3 pt-1 uppercase tracking-wider'>
Admin Controls
</div>


<Link 
onClick={handleClose}
to={"/dashboard/add-delivery-partner"}
className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'
>
Add Delivery Partner
</Link>


<Link
onClick={handleClose}
to={"/dashboard/delivery-partners"}
className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'
>
Delivery Partners
</Link>

</>
)
}
            <Link onClick={handleClose} to={"/dashboard/address"} className='px-3 py-2 hover:bg-orange-50 hover:text-orange-600 rounded-lg font-medium transition-colors'>Save Address</Link>

            {/* Logout Trigger */}
            <button 
              onClick={handleLogout} 
              className='w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors mt-1 cursor-pointer'
            >
              Log Out
            </button>
        </div>
    </div>
  )
}

export default UserMenu