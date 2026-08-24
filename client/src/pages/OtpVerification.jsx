import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OtpVerification = () => {
    const [data, setData] = useState(["","","","","",""])
    const [loading, setLoading] = useState(false) // स्मूथ यूआई के लिए सबमिशन लोडिंग स्टेट
    const navigate = useNavigate()
    const inputRef = useRef([])
    const location = useLocation()

    useEffect(()=>{
        if(!location?.state?.email){
            navigate("/forgot-password")
        }
    }, [location, navigate])

    const valideValue = data.every(el => el)

    const handleChange = (value, index) => {
        // केवल नंबर्स को अलाउ करने के लिए (Optional रिफाइनमेंट)
        if (isNaN(value)) return; 

        const newData = [...data]
        // यदि यूजर वैल्यू पेस्ट करता है या मल्टीपल कैरेक्टर आते हैं, तो केवल आखिरी कैरेक्टर लें
        newData[index] = value.slice(-1) 
        setData(newData)

        // अगला इनपुट बॉक्स ऑटो-फोकस करें
        if(value && index < 5){
            inputRef.current[index+1]?.focus()
        }
    }

    // 🔥 बेस्ट UX के लिए: Backspace दबाने पर पिछले बॉक्स पर फोकस ले जाने का लॉजिक
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !data[index] && index > 0) {
            inputRef.current[index-1]?.focus();
        }
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data : {
                    otp : data.join(""),
                    email : location?.state?.email
                }
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                navigate("/reset-password",{
                    state : {
                        data : response.data,
                        email : location?.state?.email
                    }
                })
            }

        } catch (error) {
            console.log('error',error)
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='w-full min-h-[80vh] flex items-center justify-center container mx-auto px-4 bg-neutral-50/30'>
            <div className='bg-white my-8 w-full max-w-md mx-auto rounded-2xl p-6 md:p-8 border border-neutral-100 shadow-xl animate-in zoom-in-95 duration-150'>
                
                {/* Header Section */}
                <div className='mb-2'>
                    <h2 className='font-extrabold text-2xl text-neutral-800 tracking-tight'>Verification Code</h2>
                    <p className='text-xs text-neutral-400 font-medium mt-1 leading-relaxed'>
                        We have sent a 6-digit OTP to <span className='text-neutral-700 font-bold'>{location?.state?.email || 'your email'}</span>.
                    </p>
                </div>

                {/* OTP Form Wrapper */}
                <form className='flex flex-col gap-5 py-4' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor='otp-0' className='text-sm font-bold text-neutral-700'>
                            Enter Security OTP
                        </label>
                        
                        {/* 6-Digit Flex Box Grid */}
                        <div className='flex items-center gap-2.5 justify-between mt-1'>
                            {
                                data.map((element, index)=>{
                                    return(
                                        <input
                                            key={"otp"+index}
                                            id={`otp-${index}`}
                                            type='text'
                                            inputMode='numeric' // मोबाइल पर सिर्फ न्यूमेरिक कीपैड ओपन होगा
                                            pattern='[0-9]*'
                                            ref={(ref)=>{
                                                inputRef.current[index] = ref
                                                return ref 
                                            }}
                                            value={data[index]}
                                            onChange={(e) => handleChange(e.target.value, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            maxLength={1}
                                            disabled={loading}
                                            autoComplete="one-time-code"
                                            className='bg-neutral-50 w-full aspect-square max-w-12 sm:max-w-14 p-2 border border-neutral-200 rounded-xl outline-none text-lg text-center font-extrabold text-neutral-800 transition-all focus:bg-white focus:border-primary-200 focus:ring-1 focus:ring-primary-200/30 disabled:opacity-60'
                                        />
                                    )
                                })
                            }
                        </div>
                    </div>
             
                    {/* Action Verification Button */}
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
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                {/* Bottom Redirection Links */}
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

export default OtpVerification