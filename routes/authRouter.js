const router = require("express").Router()
const   { registerAuth , loginAuth , getAuth , deleteAuth , updateAuth , changePictureAuth , changePassword , getCustomAuth } = require("../controllers/authController")
const path = require("path")
const {auth_upload} = require( "../controllers/Multers/multer" )
const {verifyToken} = require("../JWT/jwt")

//post
    router.post("/register", auth_upload.single("Auth") , registerAuth )
    router.post( "/login" , loginAuth )
//get
    router.get("/get" , verifyToken , getAuth )
    router.get("/get/:id" , getCustomAuth )
//put
    router.put("/update" , verifyToken , updateAuth)
    router.put("/change-picture" , verifyToken, auth_upload.single("Auth") , changePictureAuth )
    router.put("/change-password" , verifyToken , changePassword )
//delete
    router.delete("/delete" , verifyToken , deleteAuth )

module.exports = router;