const fs = require("fs")
const path = require("path")
const {conn} = require("../model/Database")
const bcrypt = require("bcrypt")
const e = require("express")


const createItem = (req , res)=>{
    const { title , description , qty , price , discount , category_id } = req.body

    if( title.length < 50 && title != "" ){

        if(description.length < 500 && description != "" ){

            if( qty == "" && price == "", category_id == "" ){
                res.status(301).json({Message : "Qauntity and Price and Category_Id can't emty! "})
            }else{
                conn.query(`select auth_id,auth_password,auth_type from auth_tb where auth_email = '${req.auth.email}' ` , (err , suc)=>{
                    if(err) res.send(err)
                    else{
                        
                        if(suc[0].auth_type == "Seller" || suc[0].auth_type == "seller"  ){

                            let checkPassword = bcrypt.compareSync( req.auth.password , suc[0].auth_password )
                            if(!checkPassword){
                                res.status(301).send({Message:"Something wrong!"})
                            }else{
                            
                                    let dis = 0.0
                                    if(discount != "") dis = discount
                                    conn.query(`insert into items_tb( item_title , item_description , item_qty , item_price , item_discount , category_id , auth_id, item_picture ) values( '${title}' , '${description}' , '${qty}' , '${price}' , '${dis}' , '${category_id}' , '${suc[0].auth_id}' , '${req.pic}' )  ` , (er , su)=>{

                                        if(!er){
                                            res.json({Message : "Item created successfully" })
                                        }else{
                                            res.send(er)
                                        }

                                    } )

                            }

                        }else{
                            res.status(301).json({Message:"Not allow to create item!"})
                        }

                    }
                } )
            }

        }else{
            res.status(301).json({Message : "Descriptions must less than 500 charecter!"})
        }

    }else{
        res.status(301).json({Message : "Title must less than 50 charecter!"})
    }

}

const updateItem = (req , res)=>{

    const { title , description , id } = req.body

    conn.query(`select auth_id,auth_password,auth_type from auth_tb where auth_email = '${req.auth.email}' ` , (err , suc)=>{
        if(err) res.send(err)
        else{
            
            if(suc[0].auth_type == "Seller" || suc[0].auth_type == "seller"  ){

                let checkPassword = bcrypt.compareSync( req.auth.password , suc[0].auth_password )
                if(!checkPassword){
                    res.status(301).send({Message:"Something wrong!"})
                }else{
                    conn.query(`select * from items_tb where auth_id = '${suc[0].auth_id}' ` , (error , success)=>{
                        if(error) res.send(error)
                        else{
                            if(success.length > 0){
                                let checkId = success.find((v)=>{
                                    return v.item_id == id   
                                })
                                if(checkId){
                                    if(title.length < 50 && title != "" && description.length < 500 && description != "" ){
                                            conn.query(`update items_tb set item_title = '${title}' , item_description = '${description}' where item_id = ${id} ` , (er , su)=>{
                                                    if(!er){
                                                            res.json({Message:"Updated successfully!"})
                                                    }else{
                                                            res.send(er)
                                                    }
                                                    } )
                                    }else{
                                            res.status(301).json({Message:"Something wrong"})
                                    }
                                }else{
                                    res.status(301).json({Message:"Not allow to update!"})
                                }


                            }else{
                                res.status(301).json({Message:"Not allow to update!"})
                            }
                                                    
                        }

                    } )

                }

            }else{
                res.status(301).json({Message:"Not allow to create item!"})
            }

        }
    } )

}

const changePictureItem = (req , res)=>{
    const { id } = req.body
    const { email , password } = req.auth

    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error){
            res.send(error)
        }else{
            let checkPassword = bcrypt.compareSync(password , success[0].auth_password)
            if(!checkPassword){
                res.status(301).json({Message:"Not allow to change"})
            }else{
                if(success[0].auth_type == "seller" || success[0].auth_type == "Seller" ){

                    conn.query(`select * from items_tb where auth_id = ${success[0].auth_id} ` , (err , suc)=>{
                        if(suc.length > 0){
                            if(err){
                                fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                                res.send(err)
                            } 
                            else{
                                let picture = suc[0].item_picture
                                if(suc.length > 0){

                                    let checkId = suc.find((v)=>{
                                        return v.item_id == id
                                    })

                                    if(!checkId){
                                        fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                                        res.status(301).json({Message:"Something wrong"})
                                    } 
                                    else{
                                        
                                        conn.query(`update items_tb set item_picture = '${req.pic}' where item_id = ${id} ` , (e , s)=>{
                                            if(!e)
                                            {
                                                fs.unlinkSync( path.join( "picture" , "items_picture/"+ picture ) )
                                                res.json({Message : "Picture changed successfully" })
                                            } 
                                            else{
                                                fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                                                res.send(e)
                                            }
                                                
                                        }  )

                                    }

                                }else {
                                    fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                                    res.status(301).json({Message:"Not allow to change"})
                                }

                            }
                        }else{
                            fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                            res.status(301).json({Message:"Not allow to change"})
                        }
                    } )

                }else{
                    fs.unlinkSync( path.join( "picture" , "items_picture/"+req.pic ) )
                    res.status(301).json({Message:"Not allow to change"})
                }

            }
        }

    } )

}

const getItems = (req , res)=>{
    conn.query("select * from items_tb" , (er , suc)=>{
        if(er) res.send(er) 
        else{
            if(suc.length > 0 ){
                res.json({datas:suc})
            }else{
                res.status(301).json({Message:"Have no item"})
            }
        }
    } )
}

const getCustomItems = (req , res)=>{

    const {id} = req.params
    conn.query(`select * from items_tb where item_id = ${id} ` , (er , suc)=>{
        if(er) res.send(er) 
        else{
            if(suc.length > 0){
                res.json({datas:suc[0]})
            }else{
                res.status(301).json({Message:"Not found"})
            }
        }
    } )

}

const getItemsCreateBy = (req , res)=>{
    const { email , password } = req.auth
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{
        if(error) res.send(error)
        else{
            if(success.length > 0){
                let checkPassword = bcrypt.compareSync(password , success[0].auth_password)
                if(checkPassword){
                    
                    conn.query(`SELECT i.*,a.auth_username,c.category_name from items_tb i INNER JOIN auth_tb a on a.auth_id = i.auth_id INNER JOIN categories_tb c on c.category_id = i.category_id where i.auth_id = ${success[0].auth_id}` , (er , suc)=>{
                        if(er) res.send(er)
                        else{
                            res.json({datas: suc})
                        }
                    } )
                }else{
                    res.status(301).json({Message : "You are not allow"})
                }
            }
        }
    } )
}

const deleteItems =  (req , res)=>{
    const {email , password} = req.auth
    const { id } = req.body
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{
        if(error) res.send(error)
        else{
            if(success.length > 0){
                let checkPassword = bcrypt.compareSync(password , success[0].auth_password)
                if(checkPassword){
                    
                    conn.query(`select * from items_tb where auth_id = ${success[0].auth_id} and item_id = ${id} ` , (fail , result)=>{

                        if(fail) res.send(fail)
                        else{

                            conn.query(`delete from items_tb where item_id = ${id} and auth_id = ${success[0].auth_id} ` , (er, s)=>{
                                if(er) res.send(er)
                                else{
                                        fs.unlinkSync(path.join("picture" , "items_picture/"+result[0].item_picture ))
                                        res.json({Message:"Deleted successfully"})
                                }
                            } )

                        }

                    } )
                    
                }else{
                    res.status(301).json({Message : "You are not allow to delete"})
                }
            }else{
                res.status(301).json({Message:"Something's wrong"})
            }
        }
    } )
}

module.exports = {
    createItem,
    updateItem,
    changePictureItem,
    getItems,
    getCustomItems,
    getItemsCreateBy,
    deleteItems
}