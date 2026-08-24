import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [data, setData] = useState({
        email: "",
    })
    const [loading, setLoading] = useState(false) // स्मूथ सबमिशन यूआई के लिए लोडिंग स्टेट
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                navigate("/verification-otp",{
                  state : data
                })
                setData({
                    email : "",
                })
            }

        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='w-full min-h-[80vh] flex items-center justify-center container mx-auto px-4 bg-neutral-50/30'>
            <div className='bg-white my-8 w-full max-w-md mx-auto rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-xl animate-in zoom-in-95 duration-150'>
                
                {/* Heading Text Header */}
                <div className='mb-2'>
                    <h2 className='font-extrabold text-2xl text-neutral-800 tracking-tight'>Forgot Password</h2>
                    <p className='text-xs text-neutral-400 font-medium mt-1 leading-relaxed'>
                        Enter your registered email address and we'll send you a verification code (OTP) to reset your password.
                    </p>
                </div>

                {/* Form Body Wrapper */}
                <form className='flex flex-col gap-4 py-4' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='email' className='text-sm font-bold text-neutral-700'>
                            Email Address
                        </label>
                        <input
                            type='email'
                            id='email'
                            className='bg-neutral-50 px-3.5 py-2.5 border border-neutral-200 rounded-xl outline-none text-sm transition-all focus:bg-white focus:border-primary-200 focus:ring-1 focus:ring-primary-200/30 text-neutral-800 placeholder:text-neutral-400'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='name@example.com'
                            required
                            disabled={loading}
                        />
                    </div>
             
                    {/* Dynamic Action Trigger Button */}
                    <button 
                        disabled={!valideValue || loading} 
                        className={`
                            w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md mt-2 tracking-wide cursor-pointer text-center active:scale-[0.99]
                            ${valideValue && !loading
                                ? "bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/10" 
                                : "bg-neutral-100 text-neutral-400 border border-neutral-200 shadow-none cursor-not-allowed" 
                            }
                        `}
                    >
                        {loading ? "Sending Code..." : "Send OTP"}
                    </button>
                </form>

                {/* Bottom Redirection Links Area */}
                <div className='w-full h-[1px] bg-neutral-100 my-2' />
                <p className='text-sm text-neutral-500 text-center mt-2 font-medium'>
                    Already have an account?{' '}
                    <Link to={"/login"} className='font-bold text-primary-200 hover:underline transition-all'>
                        Login
                    </Link>
                </p>
            </div>
        </section>
    )
}

export default ForgotPassword