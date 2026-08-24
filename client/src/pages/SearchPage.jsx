import React, { useEffect, useState } from 'react'
import CardLoading from '../components/CardLoading'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation } from 'react-router-dom'
import noDataImage from '../assets/nothing here yet.webp'

const SearchPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const params = useLocation()
  
  // URL से सर्च टेक्स्ट निकालना (?search=query या ?q=query के आधार पर सुरक्षित स्लाइस)
  const searchText = params?.search ? decodeURIComponent(params.search.slice(3)) : ""

  const fetchData = async (currentPage) => {
    try {
      setLoading(true)
      const response = await Axios({
          ...SummaryApi.searchProduct,
          data : {
            search : searchText,
            page : currentPage,
          }
      })

      const { data : responseData } = response

      if (responseData.success) {
          if (currentPage === 1) {
            setData(responseData.data || [])
          } else {
            setData((prev) => [...prev, ...(responseData.data || [])])
          }
          setTotalPage(responseData.totalPage || 1)
      }
    } catch (error) {
        AxiosToastError(error)
    } finally {
        setLoading(false)
    }
  }

  // जब भी यूज़र नया कीवर्ड टाइप करे, पुराने डेटा को साफ करें और पेज 1 पर लाएं
  useEffect(() => {
    setData([])
    setPage(1)
    if (searchText) {
      fetchData(1)
    }
  }, [searchText])

  // जब पेज नंबर बढ़े (Infinite Scroll द्वारा), तब अगला डेटा फ़ेच करें
  useEffect(() => {
    if (page > 1 && searchText) {
      fetchData(page)
    }
  }, [page])

  const handleFetchMore = () => {
    if (totalPage > page && !loading) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <section className='w-full min-h-screen bg-neutral-50/50 animate-in fade-in duration-150'>
      <div className='container mx-auto max-w-7xl p-4 lg:py-6'>
        
        {/* Top Header Banner Dashboard */}
        <div className='mb-6 bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm flex items-center justify-between'>
          <div>
            <h1 className='text-sm text-neutral-400 font-bold uppercase tracking-wider'>Search Results</h1>
            <p className='text-xl lg:text-2xl font-extrabold text-neutral-800 mt-0.5'>
              {searchText ? `Showing results for "${searchText}"` : "Search Products"}
            </p>
          </div>
          <span className='bg-neutral-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm'>
            {data.length} Items
          </span>
        </div>

        {/* Core Product Rendering Infinite Layout */}
        {data.length > 0 && (
          <InfiniteScroll
            dataLength={data.length}
            hasMore={page < totalPage}
            next={handleFetchMore}
            loader={
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4'>
                {loadingArrayCard.map((_, index) => (
                  <CardLoading key={"loadingMore" + index} />
                ))}
              </div>
            }
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-1 items-stretch'>
              {data.map((p, index) => (
                <CardProduct data={p} key={p?._id + "searchProduct" + index} />
              ))}
            </div>
          </InfiniteScroll>
        )}

        {/* Skeleton Loading Blocks for initial state */}
        {loading && data.length === 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-1'>
            {loadingArrayCard.map((_, index) => (
              <CardLoading key={"initialLoading" + index} />
            ))}
          </div>
        )}

        {/* Beautiful Empty State Fallback Container */}
        {!loading && data.length === 0 && (
          <div className='flex flex-col justify-center items-center w-full max-w-md mx-auto text-center py-16 bg-white border border-neutral-100 rounded-2xl shadow-sm my-8 p-6'>
            <div className='w-48 h-48 flex items-center justify-center overflow-hidden mb-4 rounded-xl'>
              <img
                src={noDataImage} 
                alt='No results found'
                className='max-w-full max-h-full object-contain mix-blend-multiply'
              />
            </div>
            <h3 className='font-extrabold text-lg text-neutral-800 tracking-tight'>No Results Found</h3>
            <p className='text-xs text-neutral-400 font-medium max-w-xs mt-1 leading-relaxed'>
              We couldn't find anything matching your query. Check the spelling or try searching for another item.
            </p>
          </div>
        )}

      </div>
    </section>
  )
}

export default SearchPage