import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";



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
    }
    catch(error){
        res.json({message:error.message});
    }
}