import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';
import transporter from "../config/nodemailer.js";


export const register = async(req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({succes:false,message:'All fields are required'});
    }
    try{
        const existingUser=await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({succes:false,message:'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new userModel({name, email, password:hashedPassword});
        await user.save();

        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'12d'});

        res.cookie('token', token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:12*24*60*60*1000
        })
        //sending welcome email to new user
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Welcome to Our Platform',
            text:`Hello ${user.name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`
        }
        await transporter.sendMail(mailOptions);
        return res.json({succes:true});
    }
    catch(error){
        res.json({succes:false,message:error.message});
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({succes:false,message:'All fields are required'});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({succes:false,message:'User does not exist'});
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({succes:false,message:'Invalid password'});
        }
        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'12d'});

        res.cookie('token', token, {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
            maxAge:12*24*60*60*1000
        });
         return res.json({succes:true});


    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}

export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'none':'strict',
        });
        return res.json({succes:true,message:'Logged out successfully'});
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}
//send verification otp to user's email
export const sendVerifyOtp=async(req,res)=>{
    try{
        const userId=req.userId;

        const user=await userModel.findById(userId);
        if(!user){
            return res.status(400).json({succes:false,message:'User not found'});
        }
        if(user.isAccountVerified){
            return res.status(400).json({succes:false,message:'Account already verified'});
        }

        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now()+24*60*60*1000;

        await user.save();
        //send otp to user's email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Account Verification OTP',
            text:`Hello ${user.name},\n\nYour account verification OTP is ${otp}. It is valid for 10 minutes.`
        }
        await transporter.sendMail(mailOptions);
        return res.json({succes:true,message:'verification OTP sent to email'});
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}
//account verification otp
export const verifyEmail=async(req,res)=>{
    const userId=req.userId;
    const {otp}=req.body;
    if(!userId || !otp){
        return res.status(400).json({succes:false,message:'All fields are required'});
    }
    try{
        const user=await userModel.findById(userId);
        if(!user){
            return res.status(400).json({succes:false,message:'User not found'});
        }
        if(user.verifyOtp!==otp){
            return res.status(400).json({succes:false,message:'Invalid OTP'});
        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.status(400).json({succes:false,message:'OTP expired'});
        }
        user.isAccountVerified=true;
        user.verifyOtp='';
        user.verifyOtpExpireAt=null;
        await user.save();
        return res.json({succes:true,message:'Account verified successfully'});

    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}
//is authenticated
export const isAuthenticated=async(req,res)=>{
    try{
        return res.json({succes:true});
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}

//send password reset otp to user's email
export const sendPasswordResetOtp=async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.status(400).json({succes:false,message:'Email is required'});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({succes:false,message:'User not found'});
        }
        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now()+10*60*1000;
        await user.save();
        //send otp to user's email
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:'Password Reset OTP',
            text:`Hello ${user.name},\n\nYour account password reset OTP is ${otp}. use these OTP to reset your password.`
        }
        await transporter.sendMail(mailOptions);
        return res.json({succes:true,message:'Password reset OTP sent to email'});
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}

//reset user password
export const resetPassword=async(req,res)=>{
    const {email, otp, newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.status(400).json({succes:false,message:'All fields are required'});
    }
    try{
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({succes:false,message:'User not found'});
        }
        if(user.resetOtp!==otp){
            return res.status(400).json({succes:false,message:'Invalid OTP'});
        }
        if(user.resetOtpExpireAt<Date.now()){
            return res.status(400).json({succes:false,message:'OTP expired'});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password=hashedPassword;
        user.resetOtp='';
        user.resetOtpExpireAt=null;
        await user.save();
        return res.json({succes:true,message:'Password reset successfully'});
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}