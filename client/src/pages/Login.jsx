import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

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
            const response = await Axios({
                ...SummaryApi.login,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)

                localStorage.setItem('accesstoken', response.data.data.accesstoken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()

                if(userDetails?.data){
                    dispatch(setUserDetails(userDetails.data))
                }

                navigate("/")
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='w-full min-h-[80vh] container mx-auto px-4 flex items-center justify-center py-10'>
            
            {/* Main Premium Card Wrapper with Radial Outer Glow */}
            <div className='bg-slate-900 border border-slate-800/80 my-4 w-full max-w-md mx-auto rounded-2xl p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden'>
                
                {/* Decorative Neon Multi-Color Border Accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400" />
                
                <div className="text-center mb-6">
                    <h2 className='text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide uppercase'>
                        Welcome Back
                    </h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">Sign in to your dashboard account</p>
                </div>

                <form className='grid gap-5 py-2' onSubmit={handleSubmit}>
                    
                    {/* Email Input Block */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='email' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-slate-950/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200 text-sm'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='name@example.com'
                        />
                    </div>

                    {/* Password Input Block */}
                    <div className='grid gap-1.5'>
                        <div className="flex justify-between items-center">
                            <label htmlFor='password' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                            <Link to={"/forgot-password"} className='text-xs font-semibold text-slate-500 hover:text-cyan-400 transition-colors duration-200'>
                                Forgot password?
                            </Link>
                        </div>
                        
                        <div className='bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full bg-transparent outline-none text-slate-200 placeholder-slate-600 text-sm'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='••••••••'
                            />
                            <div 
                                onClick={() => setShowPassword(preve => !preve)} 
                                className='cursor-pointer text-slate-500 hover:text-slate-300 transition-colors pl-2'
                            >
                                {showPassword ? <FaRegEye size={18}/> : <FaRegEyeSlash size={18}/>}
                            </div>
                        </div>
                    </div>
    
                    {/* Premium Neon Interactive CTA Button */}
                    <button 
                        disabled={!valideValue} 
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 my-2 shadow-lg ${
                            valideValue 
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] hover:brightness-110 active:scale-98" 
                            : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800/50"
                        }`}
                    >
                        Sign In
                    </button>
                </form>

                {/* Bottom Redirection Prompt */}
                <p className="text-center text-sm text-slate-400 mt-4 font-medium">
                    Don't have an account? {' '}
                    <Link to={"/register"} className='font-black text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline underline-offset-4 decoration-cyan-500/30'>
                        Register
                    </Link>
                </p>
            </div>
        </section>
    )
}

export default Login