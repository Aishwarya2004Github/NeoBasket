import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';

const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage,setIsSearchPage] = useState(false)
    const [ isMobile ] = useMobile()
    const params = useLocation()
    const searchText = params.search.slice(3)

    useEffect(()=>{
        const isSearch = location.pathname === "/search"
        setIsSearchPage(isSearch)
    },[location])

    const redirectToSearchPage = ()=>{
        navigate("/search")
    }

    const handleOnChange = (e)=>{
        const value = e.target.value
        const url = `/search?q=${value}`
        navigate(url)
    }

  return (
    <div className='w-full min-w-[300px] lg:min-w-[480px] h-11 lg:h-12 rounded-xl border border-neutral-200 overflow-hidden flex items-center text-neutral-500 bg-neutral-50/80 group focus-within:border-primary-200 focus-within:bg-white focus-within:shadow-md focus-within:shadow-primary-200/10 transition-all duration-200'>
        
        {/* Left Icon Area (Back Arrow or Search Glass) */}
        <div className='flex items-center justify-center h-full pl-3 pr-2'>
            {
                (isMobile && isSearchPage ) ? (
                    <Link 
                        to={"/"} 
                        className='flex justify-center items-center p-2 text-neutral-600 hover:text-neutral-900 bg-white rounded-full shadow-sm border border-neutral-100 active:scale-95 transition-transform'
                    >
                        <FaArrowLeft size={16}/>
                    </Link>
                ) :(
                    <button 
                        type="button"
                        className='flex justify-center items-center text-neutral-400 group-focus-within:text-primary-200 transition-colors pointer-events-none'
                    >
                        <IoSearch size={20}/>
                    </button>
                )
            }
        </div>

        {/* Content Area */}
        <div className='w-full h-full flex items-center pr-3'>
            {
                !isSearchPage ? (
                     // Not in search page (Displays Typing Animation)
                     <div 
                        onClick={redirectToSearchPage} 
                        className='w-full h-full flex items-center cursor-text text-sm font-medium text-neutral-400 selection:bg-transparent'
                     >
                        <TypeAnimation
                                sequence={[
                                    'Search "milk"',
                                    1000,
                                    'Search "bread"',
                                    1000,
                                    'Search "sugar"',
                                    1000,
                                    'Search "paneer"',
                                    1000,
                                    'Search "chocolate"',
                                    1000,
                                    'Search "curd"',
                                    1000,
                                    'Search "rice"',
                                    1000,
                                    'Search "egg"',
                                    1000,
                                    'Search "chips"',
                                    1000,
                                ]}
                                wrapper="span"
                                speed={50}
                                repeat={Infinity}
                            />
                     </div>
                ) : (
                    // In Search Page (Displays Active Input)
                    <div className='w-full h-full'>
                        <input
                            type='text'
                            placeholder='Search for atta, dal and more...'
                            autoFocus
                            defaultValue={searchText}
                            className='w-full h-full bg-transparent outline-none border-none text-neutral-800 text-sm font-medium placeholder-neutral-400'
                            onChange={handleOnChange}
                        />
                    </div>
                )
            }
        </div>
        
    </div>
  )
}

export default Search