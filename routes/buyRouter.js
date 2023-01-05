const router = require("express").Router()
const {createBuy , deleteBuy } = require("../controllers/buyController")
const {verifyToken} = require("../JWT/jwt")

//post
    router.post("/create-buy" , verifyToken , createBuy )
//delete
    router.delete("/delete/:id" , verifyToken , deleteBuy )

module.exports = router
