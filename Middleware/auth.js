const jwt=require('jsonwebtoken');
const User = require("../models/Usermodel")
exports.authCustomer=async (req,res,next)=>{
    if(req.header('Authorization').replace('Bearer ', '')){
        const token=req.header('Authorization').replace('Bearer ', '');
        try{
        const user=jwt.verify(token,"this is my");
        req.user=user;
        if(req.user=="user"){
            return res.status(400).json({success:false,msg:"invalid user !"})
         }
         const previoustoken = await User.findOne({_id:user._id})
         if(previoustoken.accesstoken!=token){
             return res.status(400).json({success:false,msg:"token is expired"})
         }
        }catch(err){
            return res.status(400).json({success:false,msg:"invalid user !"})
        }
        
        
    }else{
        return res.status(400).json({message:'Authorization required'});
    }
   
    next();
}