import { createContext, useEffect } from "react";
import { useState } from "react";
import React from 'react'
import { toast } from "react-toastify";
import axios from "axios";


export const AppContent=createContext();

export const AppContextProvider=(props)=>{
    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://mern-auth-backend-n0ri.onrender.com';
    // set axios base URL so all requests go to the backend
    axios.defaults.baseURL = backendUrl;

    const [isLoggedin,setIsLoggedin]=useState(false)
    const [userData,setUserData]=useState(false)

    const getAuthState=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/auth/is-auth')
            if(data.succes){
                setIsLoggedin(true)
                getUserData()
                console.log("user is authenticated");
            }
        }
        catch(error){
            toast.error(error.message);
            console.log("user is not authenticated",error.message);
        }
    }
    const getUserData=async()=>{
        try{
            const {data}=await axios.get(backendUrl+'/api/user/data')
            data.succes ? setUserData(data.userData):toast.error(data.message)
        }
        catch(error){
            toast.error(error.message);
        }
    }

    // useEffect(()=>{
    //     getAuthState();
    // },[])

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
