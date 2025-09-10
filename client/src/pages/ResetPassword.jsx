import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useContext } from 'react'
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {

  const {backendUrl}=useContext(AppContent)
  axios.defaults.withCredentials=true



  const navigate=useNavigate()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [isEmailSent,setIsEmailSent]=useState('')
  const [otp,setOtp]=useState(0)
  const [isOtpSubmitted,setIsOtpSubmitted]=useState(false)

  const inputRefs=React.useRef([])  

  const handleInput=(e,index)=>{
    if(e.target.value.length >0 && index <inputRefs.current.length -1){
      inputRefs.current[index+1].focus();
    }
  }
  const handleKeyDown=(e,index)=>{
    if(e.key==='Backspace' && index >0 && e.target.value.length===0){
      inputRefs.current[index-1].focus();
    }  
  }
  const handlePaste=(e)=>{
    const paste=e.clipboardData.getData('text')
    const pasteArray=paste.split('');
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value=char;
      }
    })
  }

  const onEmailSubmit=async(e)=>{
    e.preventDefault();
    try{
      const {data}=await axios.post(backendUrl+'/api/auth/send-reset-otp',{email})
      data.succes ? toast.success(data.message) : toast.error(data.message)
      data.succes && setIsEmailSent(true)
    }
    catch(error){
      toast.error(error.message)
    }
  }
  const onOtpSubmit=async(e)=>{
    e.preventDefault();
      const otpArray=inputRefs.current.map(e=>e.value)
      const otpCode = otpArray.join('')
      setOtp(otpCode) 
      // const otp=otpArray.join('')
      setIsOtpSubmitted(true)
  }
  const onNewPasswordSubmit=async(e)=>{
    e.preventDefault();
    try{
      const {data}=await axios.post(backendUrl+'/api/auth/reset-password',{email,otp,newPassword:password})
      data.succes ? toast.success(data.message) : toast.error(data.message)
      data.succes && navigate('/login')
    }
    catch(error){
      toast.error(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen
     bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="" 
      className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>

      {/* email input form */}
      {!isEmailSent && 
        <form onSubmit={onEmailSubmit}
        className='bg-slate-900 p-10 rounded-lg shadow-lg w-full 
        sm:w-96 text-indigo-300 text-sm'>
          <h2 className='text-2xl font-semibold text-white text-center mb-2'>Reset Password</h2>
          <p className='text-center mb-5 text-indigo-200'>Enter your registred email adress</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt='' className='w-3 h-3'/>
            <input  type='email'placeholder='email Id' 
            className='bg-transparent outline-none text-white' value={email} 
            onChange={e=>setEmail(e.target.value)} required/>
          </div>
          <button 
          className='w-full py-3 bg-gradient-to-r from-indigo-400 to-indigo-900 
          text-white rounded-full'
          >Submit</button>
        </form>
  }
      {/* otp input form */}
      {!isOtpSubmitted && isEmailSent &&
        <form onSubmit={onOtpSubmit}
        className='bg-slate-900 p-10 rounded-lg shadow-lg w-full 
        sm:w-96 text-indigo-300 text-sm'>
          <h2 className='text-2xl font-semibold text-white text-center mb-2'>Reset Password OTP </h2>
          <p className='text-center mb-5 text-indigo-200'>Enter the 6-digit code sent to your email</p>

          <div className='flex justify-between mb-6'onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength="1" key={index} required 
                className="w-12 h-12 bg-[#333A5c] text-white text-center text-xl rounded-md"
                ref={e=>inputRefs.current[index]=e}
                onInput={(e)=>handleInput(e,index)}
                onKeyDown={(e)=>handleKeyDown(e,index)}
              />
            ))}
          </div>
            <button 
            className='w-full py-2.5 bg-gradient-to-r from-indigo-400 to-indigo-900
            text-white rounded-full'>Submit</button>
        </form>
      }
      {/* enter new password */}
      {isOtpSubmitted && isEmailSent &&
        <form onSubmit={onNewPasswordSubmit}
        className='bg-slate-900 p-10 rounded-lg shadow-lg w-full 
        sm:w-96 text-indigo-300 text-sm'>
          <h2 className='text-2xl font-semibold text-white text-center mb-2'>New Password</h2>
          <p className='text-center mb-5 text-indigo-200'>Enter the New Password below</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt='' className='w-3 h-3'/>
            <input  type='password'placeholder='password' 
            className='bg-transparent outline-none text-white' value={password} 
            onChange={e=>setPassword(e.target.value)} required/>
          </div>
          <button 
          className='w-full py-3 bg-gradient-to-r from-indigo-400 to-indigo-900 
          text-white rounded-full'
          >Submit</button>
        </form>
      }
    </div>
  )
}

export default ResetPassword
