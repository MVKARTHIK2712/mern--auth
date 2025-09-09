import userModel from "../models/userModel.js";

export const getUserData=async(req,res)=>{
    try{
        const userId=req.userId;

        const user=await userModel.findById(userId);
        if(!user){
            return res.status(400).json({succes:false,message:'User not found'});
        }
        return res.json({succes:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isAccountVerified
            }
        });
    }
    catch(error){
        return res.json({succes:false,message:error.message});
    }
}