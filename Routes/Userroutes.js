const express = require('express')
const router = express.Router()
const multer  = require('multer')
const path = require("path")
const crypto=require("crypto")
const auth = require("../Middleware/auth").authCustomer
const {validateSinginRequest, isRequestValidated,validateemptyrequest } = require("../validator/uservalidator");  


const controller=require("../controller/Usercontroller")
const storage = multer.diskStorage({
    destination: 'characterupload',
    filename: function(_req, file, cb){
      
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    } 
  });
  console.log(storage);
var upload = multer({
    storage: storage,
    limits: {
        fields: 10,
        fieldNameSize: 50, // TODO: Check if this size is enough
        fieldSize: 20000, //TODO: Check if this size is enough
        // TODO: Change this line after compression
        fileSize: 15000000, // 150 KB for a 1080x1080 JPG 90
    },
    fileFilter: function(_req, file, cb){
        checkFileType(file, cb);
    }
}).single('image');
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

router.post('/api/register',validateSinginRequest,isRequestValidated,controller.register)
router.post('/api/login',validateSinginRequest,isRequestValidated,controller.Login)
router.post('/api/create-profile',auth,upload,controller.createprofile)
router.get('/api/get-profile',auth,controller.getprofile)
router.get('/api/get-Allusers',controller.getusers)
router.post('/api/Import-Token',auth,controller.importtoken)
router.post('/api/send-tokens',auth,controller.sendtokens)
router.get('/api/get-Transaction',controller.getTransaction)
router.get('/api/get-reward',auth,controller.getreward)
router.post('/api/update_profile',auth,upload,controller.update_profile)
router.get('/api/send_referal',auth,controller.sendreferal)
router.get("/email/:id", controller.email)
router.post("/email/:id",controller.resetPassword)
router.post('/api/forgetpass',controller.forgetPassword)
router.post('/api/getaccount_balance',controller.getaccountbalance)
router.post('/api/getaccount_allimport-tokens',controller.getallimport_tokens)
router.get('/api/getlogin_time',auth,controller.get_time)
router.post('/api/Addlogin_time',auth,controller.post_time)
router.get('/api/get_referalcode',auth,controller.get_referalcode)
router.post('/api/add_closeapptiming',auth,controller.closeapp_timimg)
router.post('/api/add_logoutapptiming', auth, controller.logoutapp_timing)
router.get("/api/get_closeapptiming",auth,controller.gettime)
router.post("/api/redeemtoken",auth,controller.redeemtoken)
router.post("/api/get_users_of_referalcode",controller.get_usedreferalusers)
router.get("/api/getreferalcode",auth,controller.getreferalcode)
router.get("/api/refreshtoken",controller.refreshtoken)
router.get("/api/emailverifiaction/:id/:code/:password",controller.emailverification)

module.exports = router 