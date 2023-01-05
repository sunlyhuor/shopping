const express = require("express")
const app = express()
const bodyparser = require("body-parser")
const cors = require("cors")
const env = require("dotenv")
const path = require("path")
//Import router
const authRouter = require("../routes/authRouter")
const itemRouter = require("../routes/itemRouter")
const storeRouter = require("../routes/storeRouter")
const buyRouter = require("../routes/buyRouter")
const categoryRouter = require("../routes/categoryRouter")
//env
env.config()

//Middleware
app.use(cors({
    origin:"*"
}))
app.use( bodyparser.json() )
app.use( bodyparser.urlencoded( {extended : true} ) )

//Static
app.use("/auth/profile/", express.static( path.join( "picture" , "auth_profile/" ) ) )
app.use("/item/picture" , express.static( path.join("picture" , "items_picture/" ) ))
//Router
app.use("/api/auth/" , authRouter)
app.use("/api/item/", itemRouter)
app.use("/api/store/" , storeRouter )
app.use("/api/buy/" , buyRouter )
app.use("/api/category" , categoryRouter )
//Run server
const port = 2000;
app.listen(port , ()=>{
    console.log( "server run on port : " + port );
})
