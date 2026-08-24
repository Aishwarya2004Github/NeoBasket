import React, { useEffect, useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false) // बेहतर UX के लिए लोडिंग स्टेट

  const valideValue = Object.values(data).every(el => el)

  useEffect(() => {
    if (!(location?.state?.data?.success)) {
      navigate("/")
    }

    if (location?.state?.email) {
      setData((prev) => ({
        ...prev,
        email: location?.state?.email
      }))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  console.log("data reset password", data)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirm password must be same.")
      return
    }

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: data
      })
      
      if (response.data.error) {
        toast.error(response.data.message)
      }

      if (response.data.success) {
        toast.success(response.data.message)
        navigate("/login")
        setData({
          email: "",
          newPassword: "",
          confirmPassword: ""
        })
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='w-full min-h-[80vh] flex items-center justify-center px-4 bg-neutral-50/50 animate-in fade-in duration-150'>
      <div className='bg-white w-full max-w-md rounded-2xl p-6 lg:p-8 border border-neutral-100 shadow-sm'>
        <div className='space-y-1 text-center sm:text-left'>
          <h2 className='font-extrabold text-xl lg:text-2xl text-neutral-800 tracking-tight'>Reset Password</h2>
          <p className='text-xs text-neutral-400 font-medium'>Please choose a strong password for your account</p>
        </div>

        <form className='flex flex-col gap-4 pt-6' onSubmit={handleSubmit}>
          
          {/* New Password Input Field */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='newPassword' className='text-xs font-bold text-neutral-500 uppercase tracking-wider'>
              New Password
            </label>
            <div className='h-11 w-full bg-neutral-50 px-3 flex items-center gap-2 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>
              <input
                type={showPassword ? "text" : "password"}
                id='newPassword'
                className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
                name='newPassword'
                value={data.newPassword}
                onChange={handleChange}
                placeholder='Enter new password'
                required
              />
              <button 
                type='button'
                onClick={() => setShowPassword(prev => !prev)} 
                className='text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer shrink-0 transition-colors'
              >
                {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input Field */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='confirmPassword' className='text-xs font-bold text-neutral-500 uppercase tracking-wider'>
              Confirm Password
            </label>
            <div className='h-11 w-full bg-neutral-50 px-3 flex items-center gap-2 rounded-xl border border-neutral-200 focus-within:bg-white focus-within:border-primary-200 focus-within:ring-1 focus-within:ring-primary-200/30 transition-all'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id='confirmPassword'
                className='h-full w-full outline-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400'
                name='confirmPassword'
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder='Confirm your password'
                required
              />
              <button 
                type='button'
                onClick={() => setShowConfirmPassword(prev => !prev)} 
                className='text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer shrink-0 transition-colors'
              >
                {showConfirmPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
              </button>
            </div>
          </div>
          
          {/* Main Core Form Action Submit Trigger Button */}
          <button 
            type='submit'
            disabled={!valideValue || loading} 
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md mt-2 tracking-wide text-center active:scale-[0.99] ${
              valideValue && !loading
                ? "bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/10 cursor-pointer" 
                : "bg-neutral-100 text-neutral-400 border border-neutral-200 shadow-none cursor-not-allowed"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className='mt-6 border-t border-neutral-100 pt-4 text-center'>
          <p className='text-xs text-neutral-400 font-medium'>
            Remembered your password?{' '}
            <Link to="/login" className='font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all'>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ResetPassword