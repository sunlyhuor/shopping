const { conn } = require("../model/Database")
const bcrypt = require("bcrypt")
const {isEmail , isPassword} = require("../controllers/components/Validation")
const fs = require("fs")
const path = require("path")
const {createToken} = require("../JWT/jwt")
const { json } = require("body-parser")
const e = require("express")

//encrypt password
const PasswordEncrypt = (password)=>{
    let salt = bcrypt.genSaltSync(15)
    let pass = bcrypt.hashSync(password , salt)
    return pass;
}

//register controller
const registerAuth = (req , res)=>{
    const {username , firstname , lastname , email , password , type} = req.body
    

    if( !isEmail(req.body.email) ){
        res.status(301).json({Message:"Email's required"})
    }else{
        if(password.length < 8){
            fs.unlinkSync( path.join( "picture" , "auth_profile" + "/"+ req.image ) )
            res.status(301).json({Messaege: "Password's more than 8!"})
        } 
        else if( !isPassword(password) ) {
            fs.unlinkSync( path.join( "picture" , "auth_profile" + "/"+ req.image ) )
            res.status(301).json({Messaege : "Password's must end with 2 special character! exampale: example!@#$"})
        }
        else{

            if(username === "" && firstname === "" && lastname === "" && type == "" ) {
                fs.unlinkSync( path.join( "picture" , "auth_profile" + "/"+ req.image ) )
                res.status(301).json({Message: "Something's wrong"})
            }else{
                // Check Username
                conn.query( `select * from auth_tb where auth_username = '${username}' ` , (error , success)=>{
                        if(error) res.status(401).json( { error : error} )
                        else{
                            if( success.length > 0 ){
                                fs.unlinkSync( path.join( "picture" , "auth_profile" + "/"+ req.image ) )
                                res.status(301).json({Message : "Username's already register"})
                            } 
                            else{
                                //Check email
                                conn.query( `select * from auth_tb where auth_email = '${email}' ` , (err , suc)=>{
                                    if(err) res.status(401).json( { err : err} )
                                    else{
                                        if( suc.length > 0 ) res.status(301).json({Message : "Email's already register"})
                                        else{
                                            conn.query(`insert into auth_tb(auth_username , auth_firstname , auth_lastname , auth_email , auth_password , auth_profile , auth_type ) values('${username}' , '${firstname}' , '${lastname}' , '${email}' , '${PasswordEncrypt(password)}' , '${ req.image }' , '${type}' )`,(fail , succ)=>{
                                                    if(fail){
                                                        fs.unlinkSync( path.join( "picture" , "auth_profile" + "/"+ req.image ) )
                                                        res.status(301).send(fail)
                                                    } 
                                                    else{
                                                        res.status(201).json({Message : "Register's successfully"})
                                                    }
                                            })
                                        }
                                    }
                            
                                } )
                            }
                        }
                } )

            }

        }
    }
    

    // conn.query( `select * from auth_tb where auth_username = '${username}' ` , (error , success)=>{
    //     if(error) res.status(401).json( { error : error} )
    //     else{
    //         if( success.length > 0 ) res.status(301).json({Message : "Username's already register"})
    //         else{
    //             //Check email
    //             conn.query( `select * from auth_tb where auth_email = '${email}' ` , (err , suc)=>{
    //                 if(err) res.status(401).json( { err : err} )
    //                 else{
    //                     if( suc.length > 0 ) res.status(301).json({Message : "Email's already register"})
    //                     else{
    //                         conn.query(`insert into auth_tb(auth_username , auth_firstname , auth_lastname , auth_email , auth_password , auth_profile) values('${username}' , '${firstname}' , '${lastname}' , '${email}' , '${pass}' , '${ req.image }')`,(fail , succ)=>{
    //                                 if(fail){
    //                                     res.status(301).send(fail)
    //                                 } 
    //                                 else{
    //                                     res.status(201).json({Messaege : "Register's successfully"})
    //                                 }
    //                         })
    //                     }
    //                 }
            
    //             } )
    //         }
    //     }

    // } )

}

//Login Controller

const loginAuth = (req , res)=>{
    const { email , password } = req.body
    if(email != '' && password != ""){ 
        conn.query(`SELECT * FROM auth_tb where auth_email = '${email}'` , (err , suc)=>{
            if(err){
                res.send(err)
            }else{
                
                if( suc.length > 0 ){
                    
                    let checkPassword = bcrypt.compareSync( password , suc[0].auth_password )
                    if(!checkPassword){
                        res.status(301).json({Message:"Password's wrong!"})
                    }else{
                        let token = createToken( email , password )
                        res.json({Message:"Login successfully!" , token : token , type : suc[0].auth_type })
                    }

                }else{
                    res.status(301).json({Message:"Email's wrong!"})
                }

            }
        })
    }else{
        res.status(301).json({Message:"Something wrong!"})
    }
}

//get controller
const getAuth = (req , res)=>{
    let { email , password } = req.auth
    // res.send(email + " " + password)
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (err , suc)=>{
        if(err) res.send(err)
        else{
            let checkPassword = bcrypt.compareSync( password , suc[0].auth_password )
            if(!checkPassword){
                res.status(301).send({Message:"Something wrong!"})
            }else{
                res.json({datas:suc[0]})    
            }
        }
    } )
}

const deleteAuth = (req , res)=>{
    const {email , password} = req.auth
   
    conn.query(`select auth_password,auth_profile from  auth_tb where auth_email = '${email}' `,  (error , success)=>{
        if(error) res.send(error)
        else{
            if(success.length > 0){
                let checkPassword = bcrypt.compareSync(password , success[0].auth_password)
                
                if( !checkPassword){
                    res.status(301).json({Message:"Password's wrong!"})
                }else{
                       conn.query(`delete from auth_tb where auth_email = '${email}' ` , (err , suc)=>{
                        if(err) res.status(301).send(err)
                        else{
                            fs.unlinkSync ( path.join("picture" , "auth_profile/" + success[0].auth_profile ) )
                            res.json({Message:"Deleted successfully!"})
                        }
                    })
                }

            }else{
                res.status(301).json({Message : "Email's wrong!"})
            }
        }
    })

 

}

const updateAuth = (req , res)=>{
    const { firstname , lastname } = req.body
    if(firstname != "" && lastname != "" ){
        conn.query(`select auth_password from auth_tb where auth_email = '${req.auth.email}'` , (error , success)=>{
            if(error) res.send(error)
            else{
                if(success.length > 0){
                    let checkPassword = bcrypt.compareSync(req.auth.password , success[0].auth_password )
                    if(checkPassword){
                        conn.query(`update auth_tb set auth_firstname = '${firstname}' , auth_lastname = '${lastname}' where auth_email = '${req.auth.email}' ` , (er , suc)=>{
                            if(!er){
                                res.json({Message:"Updated successfully!"})
                            }else{
                                res.send(er)
                            }
                        })
                    }else{
                        res.status(301).json({Message:"Not allow to update!"})
                    }
                }else{
                    res.status(301).json({Message: "Not allow to update!"})
                }
            }
        } )
    }else{
        res.status(301).json({Message:"Something wrong!"})
    }
}

const changePictureAuth = (req , res)=>{
    

        conn.query(`select auth_password,auth_profile from auth_tb where auth_email = '${req.auth.email}'` , (error , success)=>{
            if(error) res.send(error)
            else{
                if(success.length > 0){
                    let checkPassword = bcrypt.compareSync(req.auth.password , success[0].auth_password )
                    if(checkPassword){
                        let picture = success[0].auth_profile
                        conn.query(`update auth_tb set auth_profile = '${req.image}' where auth_email = '${req.auth.email}' ` , (er , suc)=>{
                            if(!er){
                                fs.unlinkSync( path.join ("picture" , "auth_profile/" + picture  ) )
                                res.json({Message:"Profile has changed"})
                            }else{
                                res.send(er)
                            }
                        } )

                    }else{
                        res.status(301).json({Message: "Not allow to change profile picture!"})
                    }
                }else{
                    res.status(301).json({Message: "Not allow to change profile picture!"})
                }
            }
        } )
}

const changePassword = (req , res)=>{
    const { oldPassword , newPassword , verifyNewPassword } = req.body
    if(newPassword != "" && verifyNewPassword != "" ){
        
        if(newPassword == verifyNewPassword){
            conn.query(`select auth_password from auth_tb where auth_email = '${req.auth.email}'` , (error , success)=>{
                if(error) res.send(error)
                else{
                    if(success.length > 0){
                        let checkPassword = bcrypt.compareSync(oldPassword , success[0].auth_password )
                        if(checkPassword){

                            conn.query(`update auth_tb set auth_password = '${ PasswordEncrypt(newPassword) }' where auth_email = '${req.auth.email}' ` , (er , suc)=>{
                                if(!er){
                                    res.json({Message:"Password has changed"})
                                }else{
                                    res.send(er)
                                }
                            } )

                        }else{
                            res.status(301).json({Message: "Not allow to change password!"})
                        }
                    }else{
                        res.status(301).json({Message: "Not allow to change picture!"})
                    }
                }
            } )
        }else{
            res.status(301).json({Message:"New Password and verify must match!"})
        }

    }else{
        res.status(301).json({Message:"Something wrong!"})
    }
}

const getCustomAuth = (req , res) =>{
    const {id} = req.params
    conn.query(`select auth_id,auth_firstname,auth_lastname,auth_type,auth_profile from auth_tb where auth_id = ${id} ` , (err , suc)=>{
        if(err) res.send(err)
        else{
            if(suc.length > 0){

                res.json({datas : suc[0] })

            }else{
                res.status(301).json({Message:"User not found!"})
            }
        }
    } )
}

module.exports = {
    registerAuth,
    loginAuth,
    getAuth,
    deleteAuth,
    updateAuth,
    changePictureAuth,
    changePassword,
    getCustomAuth
}