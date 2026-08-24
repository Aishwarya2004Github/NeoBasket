import React, { useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import EditCategory from '../components/EditCategory'
import CofirmBox from '../components/CofirmBox'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { useSelector } from 'react-redux'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    })
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id : ""
    })
    // const allCategory = useSelector(state => state.product.allCategory)


    // useEffect(()=>{
    //     setCategoryData(allCategory)
    // },[allCategory])
    
    const fetchCategory = async()=>{
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getCategory
            })
            const { data : responseData } = response

            if(responseData.success){
                setCategoryData(responseData.data)
            }
        } catch (error) {
            
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try {
            const response = await Axios({
              ...SummaryApi.deleteCategory,
              data: {
                id: deleteCategory.id
              }
            });

            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='p-4 max-w-7xl mx-auto'>
        {/* Dashboard Top Header Actions bar */}
        <div className='bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 mb-6'>
            <h2 className='font-bold text-lg text-neutral-800'>Category Management</h2>
            <button 
                onClick={()=>setOpenUploadCategory(true)} 
                className='text-sm font-semibold border border-primary-100 text-primary-200 px-4 py-2 bg-white hover:bg-primary-200 hover:text-neutral-900 rounded-lg shadow-sm transition-all cursor-pointer'
            >
                Add Category
            </button>
        </div>

        {/* Empty Fallback State */}
        {
            !categoryData[0] && !loading && (
                <div className='bg-white rounded-xl border border-neutral-100 p-8 shadow-sm flex justify-center items-center'>
                    <NoData/>
                </div>
            )
        }

        {/* Categories Infinite/Responsive Layout Grid Container */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
            {
                categoryData.map((category,index)=>{
                    return (
                        <div className='bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group' key={category._id || index}>
                            
                            {/* Image Container Aspect Box */}
                            <div className='w-full aspect-square bg-neutral-50 p-3 flex items-center justify-center border-b border-neutral-100 relative overflow-hidden'>
                                <img 
                                    alt={category.name}
                                    src={
                                        category.image?.startsWith("http")
                                            ? category.image
                                            : `http://localhost:8080${category.image}`
                                    }
                                    className='max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200'
                                />
                            </div>

                            {/* Info & Tool Actions Layer */}
                            <div className='p-3 flex flex-col gap-2.5 bg-white'>
                                <p className='text-sm font-bold text-neutral-800 text-center line-clamp-1 min-h-[20px]' title={category.name}>
                                    {category.name}
                                </p>
                                
                                <div className='w-full flex items-center gap-2 text-xs'>
                                    <button 
                                        onClick={() => {
                                            setOpenEdit(true)
                                            setEditData({
                                                _id: category?.id || category?._id,
                                                name: category?.name,
                                                image: category?.image
                                            })
                                        }}
                                        className='flex-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold py-1.5 rounded-md transition-colors cursor-pointer text-center'
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={()=>{
                                            setOpenConfirmBoxDelete(true)
                                            setDeleteCategory({
                                                id: category.id || category._id
                                            })
                                        }} 
                                        className='flex-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold py-1.5 rounded-md transition-colors cursor-pointer text-center'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>

        {/* Global Spinner State */}
        {
            loading && (
                <div className='fixed inset-0 bg-neutral-900/20 backdrop-blur-[1px] z-50 flex items-center justify-center'>
                    <Loading/>
                </div>
            )
        }

        {/* Sub-Components Modals Triggers Layout */}
        {
            openUploadCategory && (
                <UploadCategoryModel fetchData={fetchCategory} close={()=>setOpenUploadCategory(false)}/>
            )
        }

        {
            openEdit && (
                <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategory}/>
            )
        }

        {
           openConfimBoxDelete && (
            <CofirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
           ) 
        }
    </section>
  )
}

export default CategoryPage