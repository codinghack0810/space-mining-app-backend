const {check,validationResult}=require("express-validator");
const req = require("express/lib/request");
// const { successResponseWithData, ErrorResponse,invalidresponse } = require("../helper/apirespnse");
const status = '103'


exports.validateSinginRequest=[
    // check("password")
    // .isLength({min:6})
   check('email')
    .notEmpty()
    .withMessage({Success:false,Message:"email is required"}),
    check('email')
    .isEmail()
    .withMessage({Success:false,Message:"invalid email"}),
    // .withMessage({status:109,message:"password must be in 6 character"}),
    // check('email')
    // .notEmpty()
    // .withMessage({status:401,msg:"data is required"}),
    // check("password")
    // .notEmpty()
    // .withMessage({Success:false,Message:"password is required"}),
    // check("username")
    // .notEmpty()
    // .withMessage({status:406,msg:"username is empty"}),
    // check("password")
    // .notEmpty()
    // .withMessage({status:401,msg:"data is required"}),
    // check("password")
    // .isLength({min:6})
    // .withMessage({status:109,message:"password must be in 6 character"}),
    // .notEmpty()
    // .withMessage({status:107,msg:"data is required"}),
    // check('email')
    // .isEmail()
    // .withMessage({status:402,message:"invalid email"}),
    // check('email')
    // .notEmpty()
    // .withMessage({status:107,msg:"data is required"}),
    // check('email')
    // .isEmail()
    // .withMessage({status:108,message:"invalid email"}),
    // check('password')
    // .isLength({min:6})
    // .withMessage({status:109,message:"password must be in 6 character"})

];
exports.validateemptyrequest=[
    check('hash')
    .notEmpty()
    .withMessage({status:401,msg:"data is required"}),
     check("address")
    .notEmpty()
    .withMessage({status:401,msg:"data is required"}),
    check('count')
    .notEmpty()
    .withMessage({status:401,msg:"data is required"})

    
]

exports.isRequestValidated=(req,res,next)=>{
    const errors=validationResult(req);
    // console.log(errors);
    if(errors && errors.errors.length>0){
        return  res.status(200).json(errors.errors[0].msg);
        // return  res.status(200).json({status:443,msg:'data is required'});
        // return invalidresponse(res, "invalid email");
        
    }
    next();
   }