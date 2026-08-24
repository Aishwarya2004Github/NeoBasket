import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const EditAddressDetails = ({ close, data }) => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            _id: data?.id || data?._id,
            userId: data?.userId,
            address_line: data?.address_line || "",
            city: data?.city || "",
            state: data?.state || "",
            country: data?.country || "",
            pincode: data?.pincode || "",
            mobile: data?.mobile || ""
        }
    })
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async (formData) => {
        try {
            const response = await Axios({
                ...SummaryApi.updateAddress,
                data: {
                    ...formData,
                    address_line: formData.address_line,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    pincode: formData.pincode,
                    mobile: formData.mobile
                }
            })

            const { data: responseData } = response
            
            if (responseData?.success) {
                toast.success(responseData.message || "Address updated successfully")
                if (close) {
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
        <section className='fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto scrollbar-none animate-fadeIn'>
            
            {/* Cyber Terminal Form Card Container */}
            <div className='bg-slate-900 border border-slate-800/80 w-full max-w-lg my-auto rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.1)] relative overflow-hidden transform scale-95 animate-scaleUp p-6'>
                
                {/* Top Aesthetic Cyber Glow Strip Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500" />

                {/* Header Action Row */}
                <div className='flex justify-between items-center gap-4 border-b border-slate-800/60 pb-3 mb-4'>
                    <h2 className='text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide uppercase flex items-center gap-2'>
                        📡 Update Address Coordinates
                    </h2>
                    <button 
                        onClick={close} 
                        className='text-slate-400 hover:text-pink-500 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 active:scale-90'
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Matrix Inputs Grid Form */}
                <form className='grid gap-4 text-xs font-bold uppercase tracking-wider text-slate-400' onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* Full Address Input Row */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='addressline' className="text-[10px] text-cyan-400/90 font-black tracking-widest">Address Line</label>
                        <input
                            type='text'
                            id='addressline' 
                            placeholder="Enter street vector route..."
                            className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 normal-case font-medium'
                            {...register("address_line", { required: true })}
                        />
                    </div>

                    {/* Multi-Column Data Fields Split */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='grid gap-1.5'>
                            <label htmlFor='city' className="text-[10px] text-slate-400 font-black tracking-widest">City System</label>
                            <input
                                type='text'
                                id='city' 
                                placeholder="City terminal"
                                className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 normal-case font-medium'
                                {...register("city", { required: true })}
                            />
                        </div>
                        
                        <div className='grid gap-1.5'>
                            <label htmlFor='state' className="text-[10px] text-slate-400 font-black tracking-widest">State Province</label>
                            <input
                                type='text'
                                id='state' 
                                placeholder="State sector"
                                className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 normal-case font-medium'
                                {...register("state", { required: true })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className='grid gap-1.5'>
                            <label htmlFor='pincode' className="text-[10px] text-slate-400 font-black tracking-widest">Zip / Pincode</label>
                            <input
                                type='text'
                                id='pincode' 
                                placeholder="Postal matrix map code"
                                className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 font-mono font-medium'
                                {...register("pincode", { required: true })}
                            />
                        </div>

                        <div className='grid gap-1.5'>
                            <label htmlFor='country' className="text-[10px] text-slate-400 font-black tracking-widest">Country Domain</label>
                            <input
                                type='text'
                                id='country' 
                                placeholder="Global landscape"
                                className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 normal-case font-medium'
                                {...register("country", { required: true })}
                            />
                        </div>
                    </div>

                    {/* Contact Secure Connection */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='mobile' className="text-[10px] text-cyan-400/90 font-black tracking-widest">Secure Mobile Line</label>
                        <input
                            type='text'
                            id='mobile' 
                            placeholder="Comms terminal digits..."
                            className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 font-mono font-medium'
                            {...register("mobile", { required: true })}
                        />
                    </div>

                    {/* Action Execution Button */}
                    <button 
                        type='submit' 
                        className='bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-[0_4px_15px_rgba(34,211,238,0.2)] hover:shadow-[0_4px_25px_rgba(34,211,238,0.35)] transition-all duration-300 active:scale-95 mt-2'
                    >
                        Commit Dynamic Update
                    </button>
                </form>
            </div>
        </section>
    )
}

export default EditAddressDetails