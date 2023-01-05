const router = require("express").Router()
const {verifyToken} = require("../JWT/jwt")
const {createItem , updateItem, getItemsCreateBy ,changePictureItem , getItems , getCustomItems , deleteItems } = require("../controllers/itemController")
const {item_upload} = require("../controllers/Multers/multer")

//post
    router.post("/create-item" , verifyToken, item_upload.single("Item") ,createItem )

//put
    router.put( "/update" , verifyToken , updateItem )
    router.put("/change-picture" , verifyToken , item_upload.single("Item") ,changePictureItem )
//get
    router.get( "/get" , getItems )
    router.get( "/get/:id" , verifyToken ,getCustomItems )
    router.get( "/getitems" , verifyToken , getItemsCreateBy )
//Delete
    router.post("/deleteItem" , verifyToken , deleteItems )

module.exports = router
