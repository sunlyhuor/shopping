const multer = require("multer")
const path = require("path")

const auth_picture = multer.diskStorage({
    destination:( req , file , cb )=>{
        cb(null , path.join("picture" , "auth_profile/") )
    },
    filename:(req , file , cb)=>{
        // let filename = 
        let image = Date.now() + path.extname( file.originalname)
        req.image = image
        cb( null ,  image )
    }
})

//1mb
const maxSize = 3 * 1024 * 1024;
let auth_upload = multer(
    {
        storage:auth_picture,
        limits:{
            fieldSize:maxSize
        },
        fileFilter:(req , file , cb)=>{
                cb(null , true)
        }
    }
)


const item_picture = multer.diskStorage({
    destination:( req , file , cb )=>{
        cb(null , path.join("picture" , "items_picture/") )
    },
    filename:(req , file , cb)=>{
        // let filename = 
        let image = Date.now() + path.extname( file.originalname)
        req.pic = image
        cb( null ,  image )
    }
})
let item_upload = multer(
    {
        storage:item_picture,
        limits:{
            fieldSize:maxSize
        },
        fileFilter:(req , file , cb)=>{
                cb(null , true)
        }
    }
)

module.exports = {
    auth_upload,
    item_upload
}