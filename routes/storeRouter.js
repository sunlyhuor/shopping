const router = require("express").Router()
const {verifyToken} = require("../JWT/jwt")
const {createStore ,  updateStore , getStore , getCustomStore , deleteStore } = require("../controllers/storeController")

//post
    router.post("/create-store", verifyToken , createStore )
//put
    router.put("/update" , verifyToken ,  updateStore )
//get
    router.get("/get", verifyToken , getStore )
    router.get("/get/:id", verifyToken , getCustomStore )
//delete
    router.delete("/delete/:id" , verifyToken , deleteStore )

module.exports = router
