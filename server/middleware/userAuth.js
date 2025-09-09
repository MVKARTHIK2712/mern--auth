import jwt from "jsonwebtoken";


const userAuth=async (req, res, next) => {
    const {token}= req.cookies;
    if(!token){
        return res.status(401).json({succes:false,message:'Unauthorized access,login again'});
    }
    try{
        const tokenDecode=jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.userId=tokenDecode.id;
        }
        else{
            return res.status(401).json({succes:false,message:'Unauthorized access,login again'});
        }
        next();
    }
    catch(error){   
        return res.status(401).json({succes:false,message:error.message});
    }
}

export default userAuth;