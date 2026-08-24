import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const EditSubCategory = ({ close, data, fetchData }) => {

    const allCategory = useSelector(
        state => state.product.allCategory || []
    )

    const [subCategoryData, setSubCategoryData] = useState({
        id: data?.id || data?._id,
        name: data?.name || "",
        image: data?.image || "",
        categoryId:
            data?.categoryId ||
            data?.category?.id ||
            data?.category?._id ||
            ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target

        setSubCategoryData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleUploadSubCategoryImage = async (e) => {
        const file = e.target.files[0]

        if (!file) return

        try {
            const response = await uploadImage(file)

            const { data: ImageResponse } = response

            setSubCategoryData((prev) => ({
                ...prev,
                image: ImageResponse?.data?.url || ""
            }))
        } catch (error) {
            AxiosToastError(error)
        }
    }

    const handleSubmitSubCategory = async (e) => {
        e.preventDefault()

        try {

            console.log("UPDATE DATA => ", subCategoryData)

            const response = await Axios({
                ...SummaryApi.updateSubCategory,
                data: {
                    id: subCategoryData.id,
                    name: subCategoryData.name,
                    image: subCategoryData.image,
                    categoryId: subCategoryData.categoryId
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)

                if (close) close()
                if (fetchData) fetchData()
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='fixed inset-0 bg-neutral-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='w-full max-w-xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-100'>

                {/* Modal Header */}
                <div className='p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50'>
                    <h1 className='font-bold text-lg text-neutral-800'>Edit Sub Category</h1>

                    <button 
                        type="button"
                        onClick={close}
                        className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Form Wrapper */}
                <form
                    className='p-6 grid gap-5'
                    onSubmit={handleSubmitSubCategory}
                >

                    {/* Name Input */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='name' className='text-sm font-semibold text-neutral-700'>Sub Category Name</label>
                        <input
                            id='name'
                            name='name'
                            type='text'
                            placeholder='Enter sub category name'
                            value={subCategoryData.name}
                            onChange={handleChange}
                            className='w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none transition-all text-neutral-800 text-sm'
                        />
                    </div>

                    {/* Image View & Upload Grid */}
                    <div className='grid gap-1.5'>
                        <p className='text-sm font-semibold text-neutral-700'>Image</p>

                        <div className='flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 p-3 rounded-lg border border-neutral-100'>
                            
                            {/* Preview Window */}
                            <div className='border border-neutral-200 h-28 w-28 bg-white flex items-center justify-center rounded-lg overflow-hidden shadow-sm shrink-0'>
                                {
                                    !subCategoryData.image ? (
                                        <p className='text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                            No Image
                                        </p>
                                    ) : (
                                        <img
                                            alt="subcategory"
                                            src={
                                                subCategoryData.image?.startsWith("http")
                                                    ? subCategoryData.image
                                                    : `http://localhost:8080${subCategoryData.image}`
                                            }
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                }
                            </div>

                            {/* Upload Action */}
                            <div className='flex flex-col items-center sm:items-start gap-1 w-full'>
                                <label 
                                    htmlFor='uploadSubCategoryImage'
                                    className='px-4 py-2 border border-primary-100 text-primary-200 text-sm font-semibold rounded-lg hover:bg-primary-200 hover:text-neutral-900 cursor-pointer bg-white shadow-sm transition-all'
                                >
                                    Upload New Image
                                </label>
                                <p className='text-neutral-400 text-[11px] mt-1 text-center sm:text-left'>Supports JPG, PNG or WEBP formats.</p>

                                <input
                                    type='file'
                                    id='uploadSubCategoryImage'
                                    className='hidden'
                                    accept='image/*'
                                    onChange={handleUploadSubCategoryImage}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className='grid gap-1.5'>
                        <label className='text-sm font-semibold text-neutral-700'>Select Category</label>

                        <select
                            className='w-full p-2.5 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none text-sm text-neutral-800'
                            value={subCategoryData.categoryId}
                            onChange={(e) => {
                                console.log("Selected Value:", e.target.value)

                                setSubCategoryData((prev) => ({
                                    ...prev,
                                    categoryId: e.target.value
                                }))
                            }}
                        >
                            <option value="">Select Category</option>

                            {
                                allCategory.map((category) => (
                                    <option
                                        key={category.id || category._id}
                                        value={category.id || category._id}
                                    >
                                        {category.name}
                                    </option>
                                ))
                            }

                        </select>
                    </div>

                    {/* Submit Action Button */}
                    <div className='pt-2'>
                        <button
                            type='submit'
                            className={`
                                w-full py-2.5 px-4 rounded-lg font-bold text-sm shadow-sm transition-all duration-150
                                ${
                                    subCategoryData.name &&
                                    subCategoryData.image &&
                                    subCategoryData.categoryId
                                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                }
                            `}
                        >
                            Update Sub Category
                        </button>
                    </div>

                </form>

            </div>
        </section>
    )
}

export default EditSubCategory