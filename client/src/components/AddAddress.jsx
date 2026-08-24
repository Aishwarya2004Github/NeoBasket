import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset } = useForm()
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async(data)=>{
        console.log("data",data)
    
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data: {
                    address_line: data.addressline,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    mobile: data.mobile
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md h-screen overflow-auto flex items-center justify-center p-4 animate-fadeIn'>
        
        {/* Modal Container with Neon Border & Glowing Shadow */}
        <div className='bg-slate-900 border border-slate-800/80 p-6 w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden transform scale-95 animate-scaleUp'>
            
            {/* Top Pink Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-600" />
            
            {/* Header Zone */}
            <div className='flex justify-between items-center gap-4 border-b border-slate-800/60 pb-3'>
                <h2 className='text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-wide'>
                   📍 Add Shipping Address
                </h2>
                <button 
                    onClick={close} 
                    className='text-slate-400 hover:text-pink-500 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 active:scale-90'
                >
                    <IoClose size={22}/>
                </button>
            </div>

            {/* Input Form Fields */}
            <form className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4' onSubmit={handleSubmit(onSubmit)}>
                
                {/* Address Line - Full Width */}
                <div className='grid gap-1.5 sm:col-span-2'>
                    <label htmlFor='addressline' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address Line</label>
                    <input
                        type='text'
                        id='addressline' 
                        placeholder="H.No, Street, Locality..."
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("addressline",{required : true})}
                    />
                </div>

                {/* City */}
                <div className='grid gap-1.5'>
                    <label htmlFor='city' className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                    <input
                        type='text'
                        id='city' 
                        placeholder="Mumbai"
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("city",{required : true})}
                    />
                </div>

                {/* State */}
                <div className='grid gap-1.5'>
                    <label htmlFor='state' className="text-xs font-bold text-slate-400 uppercase tracking-wider">State</label>
                    <input
                        type='text'
                        id='state' 
                        placeholder="Maharashtra"
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("state",{required : true})}
                    />
                </div>

                {/* Pincode */}
                <div className='grid gap-1.5'>
                    <label htmlFor='pincode' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pincode</label>
                    <input
                        type='text'
                        id='pincode' 
                        placeholder="400001"
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("pincode",{required : true})}
                    />
                </div>

                {/* Country */}
                <div className='grid gap-1.5'>
                    <label htmlFor='country' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country</label>
                    <input
                        type='text'
                        id='country' 
                        placeholder="India"
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("country",{required : true})}
                    />
                </div>

                {/* Mobile No. - Full Width */}
                <div className='grid gap-1.5 sm:col-span-2'>
                    <label htmlFor='mobile' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                    <input
                        type='text'
                        id='mobile' 
                        placeholder="Enter 10-digit mobile number"
                        className='w-full bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 p-2.5 rounded-xl outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200 text-sm'
                        {...register("mobile",{required : true})}
                    />
                </div>

                {/* Neon Save Button */}
                <button 
                    type='submit' 
                    className='sm:col-span-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black tracking-wide text-sm py-3 rounded-xl shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] hover:brightness-110 active:scale-98 transition-all duration-200 mt-2'
                >
                    Save Address
                </button>
            </form>
        </div>
    </section>
  )
}

export default AddAddress