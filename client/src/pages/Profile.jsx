import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser } from "react-icons/hi";
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
    })
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setUserData({
            name: user.name,
            email: user.email,
            mobile: user.mobile,
        })
    }, [user])

    const handleOnChange = (e) => {
        const { name, value } = e.target 
        setUserData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data: userData
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                const updatedUser = await fetchUserDetails()
                dispatch(setUserDetails(updatedUser.data))
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='p-4 max-w-2xl mx-auto animate-in fade-in duration-150'>
            {/* Page Header Card */}
            <div className='bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-5 justify-between'>
                
                {/* Profile Avatar Wrapper Area */}
                <div className='flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full sm:w-auto'>
                    <div className='w-20 h-20 bg-neutral-100 flex items-center justify-center rounded-full overflow-hidden border-2 border-neutral-200 shadow-inner shrink-0 relative group'>
                        {
                            user.avatar ? (
                                <img
                                    alt={user.name}
                                    src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:8080${user.avatar}`}
                                    className='w-full h-full object-cover'
                                />
                            ) : (
                                <FaRegUserCircle size={45} className='text-neutral-400' />
                            )
                        }
                    </div>
                    <div>
                        <h2 className='font-extrabold text-xl text-neutral-800 tracking-tight'>{user.name || "Your Profile"}</h2>
                        <p className='text-xs text-neutral-400 font-medium mt-0.5'>Update your personal identity details</p>
                    </div>
                </div>

                <button 
                    onClick={() => setProfileAvatarEdit(true)} 
                    className='text-xs font-bold border border-neutral-200 hover:border-neutral-800 bg-white hover:bg-neutral-50 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer'
                >
                    Change Picture
                </button>
            </div>

            {/* Avatar Edit Modal Element conditional render */}
            {
                openProfileAvatarEdit && (
                    <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
                )
            }

            {/* Main Form Fields Container Block */}
            <div className='bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm'>
                <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                    
                    {/* Input Field: Name */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='profile-name' className='text-xs font-bold text-neutral-500 uppercase tracking-wider'>
                            Full Name
                        </label>
                        <div className='h-11 w-full bg-neutral-50 px-3 flex items-center gap-2.5 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>
                            <HiOutlineUser size={18} className='text-neutral-400' />
                            <input
                                id='profile-name'
                                type='text'
                                placeholder='Enter your name' 
                                className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
                                value={userData.name || ""}
                                name='name'
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Input Field: Email */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='profile-email' className='text-xs font-bold text-neutral-500 uppercase tracking-wider'>
                            Email Address
                        </label>
                        <div className='h-11 w-full bg-neutral-50 px-3 flex items-center gap-2.5 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>
                            <HiOutlineMail size={18} className='text-neutral-400' />
                            <input
                                type='email'
                                id='profile-email'
                                placeholder='Enter your email' 
                                className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
                                value={userData.email || ""}
                                name='email'
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Input Field: Mobile */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='profile-mobile' className='text-xs font-bold text-neutral-500 uppercase tracking-wider'>
                            Phone Number
                        </label>
                        <div className='h-11 w-full bg-neutral-50 px-3 flex items-center gap-2.5 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>
                            <HiOutlinePhone size={18} className='text-neutral-400' />
                            <input
                                type='text'
                                id='profile-mobile'
                                placeholder='Enter your mobile' 
                                className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
                                value={userData.mobile || ""}
                                name='mobile'
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Action Confirmation CTA Button */}
                    <button 
                        type='submit'
                        disabled={loading}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md mt-2 tracking-wide cursor-pointer text-center active:scale-[0.99] ${
                            loading 
                                ? "bg-neutral-100 text-neutral-400 border border-neutral-200 shadow-none cursor-not-allowed"
                                : "bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/10"
                        }`}
                    >
                        {loading ? "Saving Changes..." : "Save Profile"}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default Profile