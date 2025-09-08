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