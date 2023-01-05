const  jwt = require("jsonwebtoken")
const env = require("dotenv")
env.config()

const createToken =  ( email , password )=>{
    let token =  jwt.sign( {email:email , password :password} , process.env.TOKEN_KEY )
    return token
}

const verifyToken = (req , res , next)=>{
    const Authorization = req.headers.authorization
    if(Authorization != "" ){
        const token = Authorization.split(" ")[1]
        jwt.verify(token , process.env.TOKEN_KEY , (err , s)=>{
            if(!err){
                req.auth = s;
                next()
            }else{
                res.status(301).json({Message:"Token's wrongs!"})
            }
        })
    }else{
        res.status(403).json({Message:"Token's required"})
    }
}

module.exports = {
    createToken,
    verifyToken
}
