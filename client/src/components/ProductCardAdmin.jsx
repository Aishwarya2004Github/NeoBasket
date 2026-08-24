import React, { useState } from 'react'
import EditProductAdmin from './EditProductAdmin'
import CofirmBox from './CofirmBox'
import { IoClose } from 'react-icons/io5'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen,setEditOpen]= useState(false)
  const [openDelete,setOpenDelete] = useState(false)

  const handleDeleteCancel  = ()=>{
      setOpenDelete(false)
  }

 const handleDelete = async () => {
  try {
    const response = await Axios({
      ...SummaryApi.deleteProduct,
      data: {
        id: data.id
      }
    })

    const responseData = response.data

    if (responseData.success) {
      toast.success(responseData.message)
      fetchProductData()
      setOpenDelete(false)
    }

  } catch (error) {
    AxiosToastError(error)
  }
}
  return (
    <div className='w-40 p-3 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group h-full'>
        <div>
            {/* Image Container */}
            <div className='w-full h-32 bg-neutral-50 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-neutral-50 group-hover:bg-neutral-100/50 transition-colors'>
                <img
                  src={
                    data?.image?.[0]?.startsWith("http")
                      ? data.image[0]
                      : `http://localhost:8080${data.image[0]}`
                  }
                  alt={data?.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm"
                />
            </div>
            
            {/* Product Meta */}
            <div className='mt-2.5 space-y-0.5'>
                <p className='text-sm text-neutral-800 font-semibold text-ellipsis line-clamp-2 min-h-[2.5rem] leading-snug' title={data?.name}>
                    {data?.name}
                </p>
                <p className='text-xs text-neutral-400 font-medium inline-block bg-neutral-100 px-1.5 py-0.5 rounded'>
                    {data?.unit || 'N/A'}
                </p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-neutral-50'>
          <button 
            onClick={()=>setEditOpen(true)} 
            className='px-2 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-all border border-emerald-100 cursor-pointer text-center'
          >
            Edit
          </button>
          <button 
            onClick={()=>setOpenDelete(true)} 
            className='px-2 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all border border-rose-100 cursor-pointer text-center'
          >
            Delete
          </button>
        </div>

        {/* Edit Product Modal Component */}
        {
          editOpen && (
            <EditProductAdmin fetchProductData={fetchProductData} data={data} close={()=>setEditOpen(false)}/>
          )
        }

        {/* Delete Confirmation Modal Overlay */}
        {
          openDelete && (
            <section className='fixed inset-0 bg-neutral-900/70 z-50 p-4 flex justify-center items-center backdrop-blur-sm animate-in fade-in duration-200'>
                <div className='bg-white p-5 w-full max-w-sm rounded-xl shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-150'>
                    
                    {/* Modal Header */}
                    <div className='flex items-center justify-between gap-4 pb-2 border-b border-neutral-100'>
                        <h3 className='font-bold text-neutral-800 text-base'>Permanent Delete</h3>
                        <button 
                          onClick={()=>setOpenDelete(false)}
                          className='p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors'
                        >
                          <IoClose size={20}/>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <p className='my-4 text-sm text-neutral-600 leading-relaxed'>
                      Are you sure you want to permanently delete <span className='font-semibold text-neutral-900'>"{data?.name}"</span>? This action cannot be undone.
                    </p>

                    {/* Modal Actions */}
                    <div className='flex justify-end gap-3'>
                      <button 
                        onClick={handleDeleteCancel} 
                        className='px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors border border-neutral-200 cursor-pointer'
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDelete} 
                        className='px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer'
                      >
                        Delete
                      </button>
                    </div>

                </div>
            </section>
          )
        }
    </div>
  )
}

export default ProductCardAdmin