import React, { useState } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { updatedAvatar } from '../store/userSlice'
import { IoClose } from "react-icons/io5";

const UserProfileAvatarEdit = ({ close }) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    const handleUploadAvatarImage = async (e) => {
        const file = e.target.files[0]

        if (!file) {
            return
        }

        const formData = new FormData()
        formData.append('avatar', file)

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.uploadAvatar,
                data: formData
            })
            const { data: responseData } = response

            dispatch(updatedAvatar(responseData.data.avatar))
            close?.() // इमेज अपलोड सफल होने पर मॉडल को आटोमेटिक क्लोज करने के लिए

        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='fixed inset-0 bg-neutral-900/70 z-50 p-4 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='bg-white max-w-sm w-full rounded-2xl p-5 flex flex-col items-center justify-center border border-neutral-100 shadow-2xl animate-in zoom-in-95 duration-150'>
                
                {/* Close Button Trigger */}
                <button 
                    type="button"
                    onClick={close} 
                    className='text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition-colors ml-auto cursor-pointer'
                >
                    <IoClose size={22} />
                </button>

                {/* Title */}
                <h3 className='text-base font-bold text-neutral-800 mb-4 mt-1'>Change Profile Picture</h3>
                
                {/* Avatar Preview Ring Container */}
                <div className='w-24 h-24 bg-neutral-100 flex items-center justify-center rounded-full overflow-hidden border-2 border-neutral-200 shadow-inner relative group'>
                    {
                        user.avatar ? (
                            <img 
                                alt={user.name || "profile"}
                                src={user.avatar}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <div className='text-neutral-400'>
                                <FaRegUserCircle size={96} />
                            </div>
                        )
                    }
                    {loading && (
                        <div className='absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-semibold animate-pulse'>
                            Uploading...
                        </div>
                    )}
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className='w-full mt-5 flex justify-center'>
                    <label htmlFor='uploadProfile' className='w-full max-w-[200px]'>
                        <div className={`
                            w-full text-center border font-bold text-sm px-4 py-2 rounded-xl shadow-sm transition-all text-center
                            ${loading 
                                ? "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed" 
                                : "border-primary-100 text-primary-200 bg-white hover:bg-primary-200 hover:text-neutral-900 cursor-pointer"
                            }
                        `}>
                            {loading ? "Processing..." : "Choose New Photo"}
                        </div>
                        <input 
                            disabled={loading} 
                            onChange={handleUploadAvatarImage} 
                            type='file' 
                            id='uploadProfile' 
                            accept='image/*'
                            className='hidden'
                        />
                    </label>
                </form>

                <p className='text-neutral-400 text-[11px] mt-3 tracking-wide text-center'>
                    Supports JPG, PNG or WEBP. Max size 2MB.
                </p>
                
            </div>
        </section>
    )
}

export default UserProfileAvatarEdit