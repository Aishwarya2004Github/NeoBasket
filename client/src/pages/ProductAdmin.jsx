import React, { useEffect, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import Loading from '../components/Loading'
import ProductCardAdmin from '../components/ProductCardAdmin'
import { IoSearchOutline } from "react-icons/io5"

const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPageCount, setTotalPageCount] = useState(1)
  const [search, setSearch] = useState("")

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProductData = async () => {
    try {
      setLoading(true)

      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: page,
          limit: 12,
          search: search.trim()
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage || 1)
        setProductData(responseData.data || [])
      }

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // PAGE + SEARCH FETCH
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductData()
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [page, search])

  // =========================================================
  // NEXT PAGE
  // =========================================================

  const handleNext = () => {
    if (page < totalPageCount) {
      setPage(prev => prev + 1)
    }
  }

  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  const handlePrevious = () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  const handleOnChange = (e) => {
    const { value } = e.target

    setSearch(value)
    setPage(1)
  }

  // =========================================================
  // RENDER STOCK STATUS
  // =========================================================

  const getStockStatus = (product) => {
    const stock = Number(product?.stock || 0)

    if (
      product?.isOutOfStock ||
      stock <= 0
    ) {
      return {
        type: "OUT_OF_STOCK",
        label: "Out of Stock",
        className: "bg-red-50 text-red-600 border-red-100"
      }
    }

    if (
      product?.stockStatus === "LOW_STOCK" ||
      stock <= 5
    ) {
      return {
        type: "LOW_STOCK",
        label: `Low Stock • ${stock} left`,
        className: "bg-orange-50 text-orange-600 border-orange-100"
      }
    }

    return {
      type: "IN_STOCK",
      label: `In Stock • ${stock}`,
      className: "bg-green-50 text-green-600 border-green-100"
    }
  }

  return (
    <section className='p-4 max-w-7xl mx-auto animate-in fade-in duration-150'>

      {/* =====================================================
          TOP CONTROLS
      ===================================================== */}

      <div className='bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>

        <div className='space-y-0.5'>

          <h2 className='font-bold text-lg text-neutral-800 tracking-tight'>
            Admin Products
          </h2>

          <p className='text-xs text-neutral-400 font-medium'>
            Manage and monitor inventory listings
          </p>

        </div>

        {/* Search */}
        <div className='h-10 max-w-xs w-full bg-neutral-50 px-3 flex items-center gap-2 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>

          <IoSearchOutline
            size={18}
            className='text-neutral-400 shrink-0'
          />

          <input
            type='text'
            placeholder='Search products...'
            className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
            value={search}
            onChange={handleOnChange}
          />

        </div>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {
        loading && (
          <div className='fixed inset-0 bg-neutral-900/10 backdrop-blur-[1px] z-50 flex items-center justify-center'>
            <Loading />
          </div>
        )
      }

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <div className='min-h-[55vh]'>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>

          {
            productData.map((p, index) => {

              const stockStatus = getStockStatus(p)

              const productId =
                p._id ||
                p.id ||
                "N/A"

              return (

                <div
                  key={productId || index}
                  className='relative'
                >

                  {/* =================================================
                      PRODUCT CARD
                  ================================================= */}

                  <div
                    className={
                      p.isOutOfStock || Number(p.stock || 0) <= 0
                        ? "rounded-xl border border-red-100"
                        : ""
                    }
                  >

                    <ProductCardAdmin
                      data={p}
                      fetchProductData={fetchProductData}
                    />

                  </div>

                  {/* =================================================
                      STOCK STATUS
                  ================================================= */}

                  <div
                    className={`
                      mt-2
                      rounded-lg
                      border
                      px-2.5
                      py-2
                      ${stockStatus.className}
                    `}
                  >

                    <div className='flex items-center justify-between gap-2'>

                      <p className='text-[10px] font-bold uppercase tracking-wide'>
                        Inventory
                      </p>

                      <span className='text-[10px] font-bold'>
                        {stockStatus.type}
                      </span>

                    </div>

                    <p className='text-xs font-bold mt-1'>
                      {stockStatus.label}
                    </p>

                  </div>

                  {/* =================================================
                      PRODUCT ID
                  ================================================= */}

                  <div className='mt-2 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5'>

                    <p className='text-[10px] font-semibold text-slate-400 uppercase'>
                      Product ID
                    </p>

                    <p
                      className='text-xs font-mono font-bold text-slate-700 break-all'
                      title={productId}
                    >
                      {productId}
                    </p>

                  </div>

                </div>

              )
            })
          }

        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {
          !loading && productData.length === 0 && (

            <div className='w-full py-20 flex flex-col items-center justify-center text-center bg-white border border-neutral-100 rounded-2xl shadow-sm'>

              <p className='text-sm font-bold text-neutral-400'>
                No products found
              </p>

              <p className='text-xs text-neutral-300 mt-0.5'>
                Try adjusting your keywords or filters
              </p>

            </div>

          )
        }

      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {
        productData.length > 0 && (

          <div className='flex items-center justify-between border-t border-neutral-100 pt-6 mt-6 max-w-sm mx-auto gap-4 select-none'>

            {/* Previous */}

            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`
                border
                text-xs
                font-bold
                px-4
                py-2
                rounded-xl
                transition-all
                active:scale-[0.98]
                ${
                  page === 1
                    ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                }
              `}
            >
              Previous
            </button>

            {/* Page */}

            <div className='text-xs font-bold text-neutral-500 bg-neutral-50 px-4 py-2 border border-neutral-100 rounded-xl tracking-wider font-mono'>
              PAGE {page} OF {totalPageCount}
            </div>

            {/* Next */}

            <button
              onClick={handleNext}
              disabled={page === totalPageCount}
              className={`
                border
                text-xs
                font-bold
                px-4
                py-2
                rounded-xl
                transition-all
                active:scale-[0.98]
                ${
                  page === totalPageCount
                    ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                    : "border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                }
              `}
            >
              Next
            </button>

          </div>

        )
      }

    </section>
  )
}

export default ProductAdmin