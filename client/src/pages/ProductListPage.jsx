import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)

  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCategory, setDisplaySubCategory] = useState([])

  // ---------------- URL PARAMS ----------------
  const subCategory = params?.subCategory?.split("-") || []
  const subCategoryName = subCategory.slice(0, -1).join(" ")

  console.log("params =", params);

  const categoryParam = params?.category || "";
  const subCategoryParam = params?.subCategory || "";

  console.log("categoryParam =", categoryParam);
  console.log("subCategoryParam =", subCategoryParam);

  const categoryId = categoryParam.slice(-36);
  const subCategoryId = subCategoryParam.slice(-36);
  
  console.log("categoryId =", categoryId);
  console.log("subCategoryId =", subCategoryId);

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProductdata = async () => {
    try {
      setLoading(true)
      console.log("categoryId =", categoryId);
      console.log("subCategoryId =", subCategoryId);

      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId,
          subCategoryId,
          page,
          limit: 8,
        },
      });

      console.log("API RESPONSE =", response.data);
      const { data: responseData } = response

      if (responseData?.success) {
        if (page === 1) {
          setData(responseData.data || [])
        } else {
          setData(prev => [...prev, ...(responseData.data || [])])
        }
        setTotalPage(responseData.totalCount || 1)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  // ---------------- EFFECT ----------------
  // जब सबकैटेगरी बदले तो पेज को वापस 1 पर रीसेट करें ताकि पुराना डेटा साफ़ हो सके
  useEffect(() => {
    setPage(1)
  }, [subCategoryId])

  useEffect(() => {
    fetchProductdata()
  }, [params, page])

  // ---------------- FILTER SUBCATEGORY SAFE ----------------
  useEffect(() => {
    const sub = AllSubCategory.filter(s => s.categoryId === categoryId)
    setDisplaySubCategory(sub)
  }, [params, AllSubCategory, categoryId])

  return (
    <section className='w-full bg-neutral-50/50 min-h-screen'>
      <div className='container mx-auto grid grid-cols-[84px,1fr] sm:grid-cols-[200px,1fr] lg:grid-cols-[260px,1fr] items-start'>
        
        {/* ---------------- LEFT SIDEBAR: SUBCATEGORY LIST ---------------- */}
        <div className='sticky top-20 lg:top-24 min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-y-auto border-r border-neutral-200 bg-white py-3 flex flex-col gap-1 scrollbar-none'>
          {
            DisplaySubCategory.map((s) => {
              console.log("SUBCATEGORY =", s);
              const catId = s.categoryId;
              console.log("catId =", catId);
              
              const link = `/${valideURLConvert(s?.category?.name || "category")}-${catId}/${valideURLConvert(s.name)}-${s.id}`;
              console.log("LINK =", link);
              
              const isActive = subCategoryId === s.id;

              return (
                <Link
                  key={s.id}
                  to={link}
                  className={`mx-2 p-2.5 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-xl transition-all duration-150 relative group ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-800 font-bold" 
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  {/* Active Indicator Left Bar */}
                  {isActive && (
                    <div className='hidden sm:block absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-md' />
                  )}

                  {/* Thumbnail Wrapper */}
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg p-1 bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100 group-hover:scale-105 transition-transform ${isActive ? 'bg-white border-emerald-100 shadow-sm' : ''}`}>
                    <img
                      src={
                        s.image?.startsWith("http")
                          ? s.image
                          : `http://localhost:8080${s.image}`
                      }
                      alt={s.name}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <p className='text-[10px] sm:text-xs md:text-sm text-center sm:text-left leading-tight break-words sm:line-clamp-2 w-full'>
                    {s.name}
                  </p>
                </Link>
              )
            })
          }
        </div>

        {/* ---------------- RIGHT SIDE: PRODUCT AREA ---------------- */}
        <div className='w-full'>
          {/* Header Dashboard Banner */}
          <div className='bg-white border-b border-neutral-100 p-4 sticky top-20 lg:top-24 z-20 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/95'>
            <div className='space-y-0.5'>
              <h3 className='font-extrabold text-base lg:text-lg text-neutral-800 capitalize tracking-tight'>
                {subCategoryName || "Products"}
              </h3>
              <p className='text-[11px] text-neutral-400 font-medium'>
                Showing {data.length} items available
              </p>
            </div>
          </div>

          {/* Dynamic Scroll Container Content */}
          <div className='p-4 min-h-[80vh]'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch'>
              {
                data.map((p) => (
                  <CardProduct
                    key={p.id || p._id}
                    data={p}
                  />
                ))
              }
            </div>

            {/* Pagination Loader Box */}
            {loading && (
              <div className='w-full py-8 flex items-center justify-center'>
                <Loading />
              </div>
            )}

            {/* Empty Screen Fallback Trigger */}
            {!loading && data.length === 0 && (
              <div className='w-full py-24 flex flex-col items-center justify-center text-center'>
                <p className='text-sm font-bold text-neutral-400 tracking-wide'>No products available</p>
                <p className='text-xs text-neutral-300 mt-0.5'>We couldn't find items in this specific segment.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}

export default ProductListPage