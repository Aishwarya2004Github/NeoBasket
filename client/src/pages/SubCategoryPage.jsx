import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import ViewImage from '../components/ViewImage'
import EditSubCategory from '../components/EditSubCategory'
import CofirmBox from '../components/CofirmBox'
import Loading from '../components/Loading'
import NoData from '../components/NoData'
import toast from 'react-hot-toast'

const SubCategoryPage = () => {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [imageURL, setImageURL] = useState("")

  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    image: "",
    category: []
  })

  const [deleteSubCategory, setDeleteSubCategory] = useState({
    id: ""
  })

  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)

  const fetchSubCategory = async () => {
    try {
      setLoading(true)

      const response = await Axios({
        ...SummaryApi.getSubCategory
      })

      const { data: responseData } = response

      if (responseData.success) {
        setData(responseData.data || [])
      }

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: {
          id: deleteSubCategory.id
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)

        fetchSubCategory()

        setOpenDeleteConfirmBox(false)

        setDeleteSubCategory({
          id: ""
        })
      }

    } catch (error) {
      AxiosToastError(error)
    }
  }

  const getImageUrl = (image) => {
    if (!image) return ""

    return image.startsWith("http")
      ? image
      : `http://localhost:8080${image}`
  }

  const getCategories = (category) => {
    if (Array.isArray(category)) {
      return category
    }

    if (category) {
      return [category]
    }

    return []
  }

  return (
    <section className='p-4 max-w-7xl mx-auto'>

      {/* ================= HEADER ================= */}
      <div className='bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 mb-6'>

        <div>
          <h2 className='font-bold text-lg text-neutral-800'>
            Sub Category Management
          </h2>

          <p className='text-xs text-neutral-400 mt-0.5'>
            Manage your product sub categories
          </p>
        </div>

        <button
          onClick={() => setOpenAddSubCategory(true)}
          className='text-sm font-semibold border border-primary-100 text-primary-200 px-4 py-2 bg-white hover:bg-primary-200 hover:text-neutral-900 rounded-lg shadow-sm transition-all cursor-pointer'
        >
          Add Sub Category
        </button>

      </div>


      {/* ================= EMPTY STATE ================= */}
      {
        !data[0] && !loading && (
          <div className='bg-white rounded-xl border border-neutral-100 p-8 shadow-sm flex justify-center items-center'>
            <NoData />
          </div>
        )
      }


      {/* ================= SUB CATEGORY GRID ================= */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>

        {
          data.map((subcategory, index) => {

            const imgUrl = getImageUrl(subcategory?.image)

            const categories = getCategories(
              subcategory?.category
            )

            const subCategoryId =
              subcategory?.id || subcategory?._id

            return (
              <div
                key={subCategoryId || index}
                className='bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group'
              >

                {/* ================= IMAGE ================= */}
                <div
                  className='w-full aspect-square bg-neutral-50 p-3 flex items-center justify-center border-b border-neutral-100 relative overflow-hidden cursor-pointer'
                  onClick={() => {
                    if (imgUrl) {
                      setImageURL(imgUrl)
                    }
                  }}
                >

                  {
                    imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={subcategory?.name}
                        className='max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200'
                      />
                    ) : (
                      <div className='text-xs text-neutral-400'>
                        No Image
                      </div>
                    )
                  }

                </div>


                {/* ================= INFO ================= */}
                <div className='p-3 flex flex-col gap-2.5 bg-white'>

                  {/* Sub Category Name */}
                  <p
                    className='text-sm font-bold text-neutral-800 text-center line-clamp-1 min-h-[20px]'
                    title={subcategory?.name}
                  >
                    {subcategory?.name}
                  </p>


                  {/* Category */}
                  <div className='flex flex-wrap justify-center gap-1 min-h-[24px]'>

                    {
                      categories.length > 0 ? (
                        categories.map((category, idx) => (
                          <span
                            key={category?.id || category?._id || idx}
                            className='bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-semibold px-2 py-1 rounded-md capitalize line-clamp-1'
                            title={category?.name}
                          >
                            {category?.name}
                          </span>
                        ))
                      ) : (
                        <span className='text-[10px] text-neutral-400 italic'>
                          No Category
                        </span>
                      )
                    }

                  </div>


                  {/* ================= ACTIONS ================= */}
                  <div className='w-full flex items-center gap-2 text-xs'>

                    {/* EDIT */}
                    <button
                      onClick={() => {
                        setEditData({
                          ...subcategory,
                          id: subCategoryId
                        })

                        setOpenEdit(true)
                      }}
                      className='flex-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold py-1.5 rounded-md transition-colors cursor-pointer text-center'
                    >
                      Edit
                    </button>


                    {/* DELETE */}
                    <button
                      onClick={() => {
                        setDeleteSubCategory({
                          id: subCategoryId
                        })

                        setOpenDeleteConfirmBox(true)
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


      {/* ================= LOADING ================= */}
      {
        loading && (
          <div className='fixed inset-0 bg-neutral-900/20 backdrop-blur-[1px] z-50 flex items-center justify-center'>
            <Loading />
          </div>
        )
      }


      {/* ================= ADD SUB CATEGORY ================= */}
      {
        openAddSubCategory && (
          <UploadSubCategoryModel
            close={() => setOpenAddSubCategory(false)}
            fetchData={fetchSubCategory}
          />
        )
      }


      {/* ================= IMAGE VIEW ================= */}
      {
        imageURL && (
          <ViewImage
            url={imageURL}
            close={() => setImageURL("")}
          />
        )
      }


      {/* ================= EDIT ================= */}
      {
        openEdit && (
          <EditSubCategory
            data={editData}
            close={() => setOpenEdit(false)}
            fetchData={fetchSubCategory}
          />
        )
      }


      {/* ================= DELETE CONFIRM ================= */}
      {
        openDeleteConfirmBox && (
          <CofirmBox
            cancel={() => setOpenDeleteConfirmBox(false)}
            close={() => setOpenDeleteConfirmBox(false)}
            confirm={handleDeleteSubCategory}
          />
        )
      }

    </section>
  )
}

export default SubCategoryPage