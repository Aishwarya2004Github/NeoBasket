import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { HiOutlineCloudUpload } from "react-icons/hi";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError';

const EditCategory = ({ close, fetchData, data: CategoryData }) => {
    const [data, setData] = useState({
        _id: CategoryData?._id,
        name: CategoryData?.name || "",
        image: CategoryData?.image || ""
    })
    const [loading, setLoading] = useState(false)

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData((preve) => ({
            ...preve,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!data.name || !data.image) return;

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateCategory, // Integrated standard endpoints mapping
                method: "put",
                url: "/api/category/update",
                data: {
                    id: data._id,
                    name: data.name,
                    image: data.image
                }
            });
            const { data: responseData } = response

            if (responseData?.success) {
                toast.success(responseData.message || "Category optimized successfully")
                close()
                fetchData()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadCategoryImage = async (e) => {
        const file = e.target.files[0]
        if (!file) return;

        try {
            setLoading(true)
            const response = await uploadImage(file)
            const { data: ImageResponse } = response
            
            setData((preve) => ({
                ...preve,
                image: ImageResponse?.data?.url || ""
            }))
            toast.success("Image vector uploaded")
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto scrollbar-none animate-fadeIn'>
            
            {/* Cyberpunk Category Form Box Container */}
            <div className='bg-slate-900 border border-slate-800/80 w-full max-w-xl my-auto rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.1)] relative overflow-hidden transform scale-95 animate-scaleUp p-6'>
                
                {/* Top Radiant Laser Strip Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-400" />

                {/* Upper Status / Header Action Row */}
                <div className='flex justify-between items-center gap-4 border-b border-slate-800/60 pb-3 mb-5'>
                    <h2 className='text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide uppercase flex items-center gap-2'>
                        🎛️ Configure Category Nodes
                    </h2>
                    <button 
                        onClick={close} 
                        className='text-slate-400 hover:text-pink-500 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 active:scale-90'
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Primary Category Fields Form */}
                <form className='grid gap-5 text-xs font-bold uppercase tracking-wider text-slate-400' onSubmit={handleSubmit}>
                    
                    {/* Category Label Title Group */}
                    <div className='grid gap-2'>
                        <label htmlFor='categoryName' className="text-[10px] text-pink-400 font-black tracking-widest">Category Signature Name</label>
                        <input
                            type='text'
                            id='categoryName'
                            placeholder='Enter category matrix tag...'
                            value={data.name}
                            name='name'
                            onChange={handleOnChange}
                            className='w-full bg-slate-950 text-slate-100 border border-slate-800/80 focus:border-pink-500/50 rounded-xl p-3 placeholder:text-slate-700 outline-none transition-all duration-200 normal-case font-medium'
                        />
                    </div>

                    {/* Media File Upload Elements Area */}
                    <div className='grid gap-2'>
                        <span className="text-[10px] text-cyan-400 font-black tracking-widest">Visual Texture / Asset Image</span>
                        <div className='flex gap-4 flex-col sm:flex-row items-center bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl'>
                            
                            {/* Asset Image Hologram Display Box */}
                            <div className='relative shrink-0 border border-slate-800 bg-slate-950 h-32 w-32 flex items-center justify-center rounded-xl overflow-hidden shadow-inner group'>
                                {
                                    data.image ? (
                                        <img
                                            alt='category metadata asset'
                                            src={data.image?.startsWith("http") ? data.image : `http://localhost:8080${data.image}`}
                                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                        />
                                    ) : (
                                        <div className="text-center p-2">
                                            <p className='text-[10px] text-slate-600 font-black tracking-tighter uppercase'>No Stream</p>
                                        </div>
                                    )
                                }
                            </div>
                            
                            {/* File System Action Upload Matrix Trigger */}
                            <div className="w-full flex flex-col gap-2">
                                <label htmlFor='uploadCategoryImage' className="w-full">
                                    <div className={`
                                        flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-black text-center text-[11px] tracking-widest cursor-pointer transition-all duration-200
                                        ${!data.name 
                                            ? "bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed" 
                                            : "border-cyan-500/30 bg-cyan-950/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400"
                                        }  
                                    `}>
                                        <HiOutlineCloudUpload size={16} />
                                        {loading ? "PROCESSING STREAM..." : "UPLOAD NEW MATRIX IMAGE"}
                                    </div>
                                    <input 
                                        disabled={!data.name} 
                                        onChange={handleUploadCategoryImage} 
                                        type='file' 
                                        id='uploadCategoryImage' 
                                        className='hidden'
                                    />
                                </label>
                                <p className="text-[9px] text-slate-500 normal-case font-medium leading-relaxed">
                                    * Name your category signature before pushing digital image assets to cloud streams.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Commit Optimization Update Button */}
                    <button
                        type="submit"
                        disabled={!data.name || !data.image || loading}
                        className={`
                            w-full font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] mt-2
                            ${data.name && data.image && !loading
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(236,72,153,0.2)] hover:shadow-[0_4px_25px_rgba(236,72,153,0.4)] hover:brightness-110" 
                                : "bg-slate-800 border border-slate-700/50 text-slate-500 cursor-not-allowed"
                            }
                        `}
                    >
                        {loading ? "TRANSMITTING DATA..." : "Commit Node Update"}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default EditCategory