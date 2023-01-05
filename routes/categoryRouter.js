const router = require("express").Router()
const {getCategory} = require("../controllers/categoryController")

router.get("/get" , getCategory )

module.exports = router


