import React, { useState } from 'react'
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

        if(data.password !== data.confirmPassword){
            toast.error("password and confirm password must be same")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                setData({
                    name : "",
                    email : "",
                    password : "",
                    confirmPassword : ""
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='w-full min-h-[85vh] container mx-auto px-4 flex items-center justify-center py-10'>
            
            {/* Cyberpunk Neon Card Container */}
            <div className='bg-slate-900 border border-slate-800/80 my-4 w-full max-w-md mx-auto rounded-2xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden'>
                
                {/* Neon Top Linear Glow Trim */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />
                
                <div className="text-center mb-6">
                    <h2 className='text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide uppercase'>
                        Create Account
                    </h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">Join NeoBasket network dashboard</p>
                </div>

                <form className='grid gap-4.5 mt-4' onSubmit={handleSubmit}>
                    
                    {/* Name Input */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='name' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            className='bg-slate-950/60 border border-slate-800 p-3 rounded-xl outline-none text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200 text-sm'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                        />
                    </div>

                    {/* Email Input */}
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

                    {/* Password Input */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='password' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
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

                    {/* Confirm Password Input */}
                    <div className='grid gap-1.5'>
                        <label htmlFor='confirmPassword' className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                        <div className='bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-200'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full bg-transparent outline-none text-slate-200 placeholder-slate-600 text-sm'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='••••••••'
                            />
                            <div 
                                onClick={() => setShowConfirmPassword(preve => !preve)} 
                                className='cursor-pointer text-slate-500 hover:text-slate-300 transition-colors pl-2'
                            >
                                {showConfirmPassword ? <FaRegEye size={18}/> : <FaRegEyeSlash size={18}/>}
                            </div>
                        </div>
                    </div>

                    {/* Interactive Pink-to-Rose Neon Button */}
                    <button 
                        disabled={!valideValue} 
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 my-2 shadow-lg ${
                            valideValue 
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] hover:brightness-110 active:scale-98" 
                            : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800/50"
                        }`}
                    >
                        Register
                    </button>
                </form>

                {/* Footer Switch Prompt */}
                <p className="text-center text-sm text-slate-400 mt-4 font-medium">
                    Already have account ? {' '}
                    <Link to={"/login"} className='font-black text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline underline-offset-4 decoration-cyan-500/30'>
                        Login
                    </Link>
                </p>
            </div>
        </section>
    )
}

export default Register