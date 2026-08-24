import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError';

const UploadCategoryModel = ({close, fetchData}) => {
    const [data,setData] = useState({
        name : "",
        image : ""
    })
    const [loading,setLoading] = useState(false)

    const handleOnChange = (e)=>{
        const { name, value} = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()


        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.addCategory,
                data : data
            })
            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                close()
                fetchData()
            }
        } catch (error) {
            AxiosToastError(error)
        }finally{
            setLoading(false)
        }
    }

    const handleUploadCategoryTypeImage = async(e)=>{
        const file = e.target.files[0]

        if(!file){
            return
        }

        const response = await uploadImage(file)
        const { data : ImageResponse } = response

        setData((preve)=>{
            return{
                ...preve,
                image: ImageResponse?.data?.url || ""
            }
        })
    }
  return (
    <section className='fixed inset-0 p-4 bg-neutral-900/70 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200'>
        <div className='bg-white max-w-xl w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-100 animate-in zoom-in-95 duration-150'>
            
            {/* Modal Header */}
            <div className='p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50'>
                <h1 className='font-bold text-lg text-neutral-800'>Add Category</h1>
                <button 
                    type="button"
                    onClick={close} 
                    className='p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors'
                >
                    <IoClose size={22}/>
                </button>
            </div>

            {/* Form */}
            <form className='p-6 grid gap-5' onSubmit={handleSubmit}>
                
                {/* Category Name Input */}
                <div className='grid gap-1.5'>
                    <label htmlFor='categoryName' className='text-sm font-semibold text-neutral-700'>Category Name</label>
                    <input
                        type='text'
                        id='categoryName'
                        placeholder='Enter category name'
                        value={data.name}
                        name='name'
                        onChange={handleOnChange}
                        className='w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none transition-all text-neutral-800 text-sm'
                    />
                </div>

                {/* Category Image Upload Area */}
                <div className='grid gap-1.5'>
                    <p className='text-sm font-semibold text-neutral-700'>Category Image</p>
                    <div className='flex gap-4 flex-col sm:flex-row items-center bg-neutral-50 p-3 rounded-lg border border-neutral-100'>
                        
                        {/* Image Preview Box */}
                        <div className='border border-neutral-200 bg-white h-28 w-28 flex items-center justify-center rounded-lg overflow-hidden shadow-sm shrink-0'>
                            {
                                data.image ? (
                                    <img
                                        alt='category'
                                        src={
                                          data.image?.startsWith("http")
                                            ? data.image
                                            : `http://localhost:8080${data.image}`
                                        }
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <p className='text-xs font-medium text-neutral-400 uppercase tracking-wider text-center'>No Image</p>
                                )
                            }
                        </div>

                        {/* Upload Button Trigger */}
                        <div className='flex flex-col items-center sm:items-start gap-1 w-full'>
                            <label htmlFor='uploadCategoryImage'>
                                <div className={`
                                    px-4 py-2 rounded-lg text-sm font-semibold border shadow-sm transition-all text-center
                                    ${!data.name 
                                        ? "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed" 
                                        : "border-primary-100 text-primary-200 bg-white hover:bg-primary-200 hover:text-neutral-900 cursor-pointer"
                                    }  
                                `}>
                                    Upload Image
                                </div>

                                <input 
                                    disabled={!data.name} 
                                    onChange={handleUploadCategoryTypeImage} 
                                    type='file' 
                                    id='uploadCategoryImage' 
                                    accept='image/*'
                                    className='hidden'
                                />
                            </label>
                            <p className='text-neutral-400 text-[11px] mt-1 text-center sm:text-left'>
                                {!data.name ? "Please enter a category name first." : "Supports JPG, PNG or WEBP formats."}
                            </p>
                        </div>
                        
                    </div>
                </div>

                {/* Submit Action Button */}
                <div className='pt-2'>
                    <button
                        type='submit'
                        disabled={loading || !data.name || !data.image}
                        className={`
                            w-full py-2.5 px-4 rounded-lg font-bold text-sm shadow-sm transition-all duration-150 text-center
                            ${data.name && data.image && !loading
                                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                            }
                        `}
                    >
                        {loading ? "Adding Category..." : "Add Category"}
                    </button>
                </div>
            </form>
        </div>
    </section>
  )
}

export default UploadCategoryModel