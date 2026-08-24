import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6"
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'

const CategoryWiseProductDisplay = ({ id, name }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef()

    const subCategoryData = useSelector(state => state.product.allSubCategory || [])
    const loadingCardNumber = new Array(6).fill(null)

    // ---------------- FETCH PRODUCTS ----------------
    const fetchCategoryWiseProduct = async () => {
        if (!id) return

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: { id }
            })

            const { data: responseData } = response
            if (responseData?.success) {
                setData(responseData.data || [])
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategoryWiseProduct()
    }, [id])

    // ---------------- SCROLL CONTROLS ----------------
    const handleScrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollLeft -= 320
        }
    }

    const handleScrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollLeft += 320
        }
    }

    // ---------------- SEE ALL LINK FORMATTER ----------------
    const getRedirectURL = () => {
        const subcategory = subCategoryData.find(
            sub => sub.categoryId === id || sub.category_id === id
        );

        if (!subcategory) return "#";
        
        const parentId = id || subcategory.categoryId;
        const subId = subcategory.id || subcategory._id;

        return `/${valideURLConvert(name)}-${parentId}/${valideURLConvert(subcategory.name)}-${subId}`;
    }

    const redirectURL = getRedirectURL()

    // Render nothing if not loading and no product items exist to save layout noise
    if (!loading && data.length === 0) return null;

    return (
        <div className='relative w-full border-b border-slate-900/40 pb-6 mb-2 group/shelf'>

            {/* Futuristic Header Section */}
            <div className='container mx-auto px-4 pt-6 pb-4 flex items-center justify-between'>
                <div className="flex items-center gap-3">
                    {/* Cyber Neon Indicator Block */}
                    <div className="w-[4px] h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
                    <h3 className='font-black text-lg md:text-xl text-slate-100 uppercase tracking-wide'>
                        {name}
                    </h3>
                </div>

                <Link
                    to={redirectURL}
                    className='text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.02)] active:scale-95'
                >
                    <span>See All</span> 
                    <FaAngleRight className="animate-[translateX_1s_infinite] transition-transform duration-200" />
                </Link>
            </div>

            {/* Horizontal Product Feed & Carousel Track Controllers */}
            <div className='relative flex items-center w-full'>
                
                {/* Left Navigation Arrow */}
                {data.length > 0 && (
                    <button 
                        onClick={handleScrollLeft}
                        className="absolute left-2 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 p-2.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 opacity-0 group-hover/shelf:opacity-100 hidden md:flex items-center justify-center active:scale-90"
                    >
                        <FaAngleLeft size={16} />
                    </button>
                )}

                {/* Main Scrollable Track */}
                <div
                    ref={containerRef}
                    className='flex gap-4 md:gap-5 container mx-auto px-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 snap-x'
                >
                    {loading ? (
                        loadingCardNumber.map((_, index) => (
                            <div key={`loading-${index}`} className="snap-start">
                                <CardLoading />
                            </div>
                        ))
                    ) : (
                        data.map((p) => {
                            const uniqueId = p.id || p._id;
                            return (
                                <div key={uniqueId} className="snap-start">
                                    <CardProduct data={p} />
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Right Navigation Arrow */}
                {data.length > 0 && (
                    <button 
                        onClick={handleScrollRight}
                        className="absolute right-2 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 p-2.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 opacity-0 group-hover/shelf:opacity-100 hidden md:flex items-center justify-center active:scale-90"
                    >
                        <FaAngleRight size={16} />
                    </button>
                )}

            </div>
        </div>
    )
}

export default CategoryWiseProductDisplay