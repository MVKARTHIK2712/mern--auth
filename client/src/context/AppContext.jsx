import { createContext, useEffect } from "react";
import { useState } from "react";
import React from 'react'
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent=createContext();

export const AppContextProvider=(props)=>{
    axios.defaults.withCredentials=true;

    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const [isLoggedin,setIsLoggedin]=useState(false)
    const [userData,setUserData]=useState(false)

    const getAuthState=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/auth/is-auth')
            if(data.succes){
                setIsLoggedin(true)
                getUserData()
            }
        }
        catch(error){
            toast.error(error.response?.data?.message || error.message);
        }
    }
    const getUserData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/user/data')
            data.succes ? setUserData(data.userData):toast.error(data.message)
        }
        catch(error){
            toast.error(error.response?.data?.message || error.message);
        }
    }

    useEffect(()=>{
        getUserData();
    },[])

    const value={
        backendUrl,
        isLoggedin,setIsLoggedin,
        userData,setUserData,
        getUserData
    }
    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}