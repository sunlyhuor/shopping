const {conn} = require("../model/Database")
const bcrypt = require("bcrypt")

const checkPassword = (pass , password)=>{
    let check = bcrypt.compareSync( pass , password )
    return check
}

const createStore = (req , res)=>{
    const {email , password} = req.auth
    const {item_id , item_qty} = req.body

    conn.query(`select * from auth_tb where auth_email = '${email}' ` ,(error , success)=>{
                if(error) res.send(error)
                else{
                    if(success.length > 0){
                        if( success[0].auth_type == "seller" || success[0].auth_type == "Seller" ){    
                            res.status(403).json({Message:"Seller account can't buy"})
                        }else{
                            
                            if(!checkPassword(password , success[0].auth_password ) ) res.status(301).json({Message:"Can't add to store"})
                        
                            else{
                                    conn.query(`select * from store_tb where item_id = ${item_id} and auth_id = ${success[0].auth_id} ` , (fa , tr)=>{
                                        if(fa) res.send(fa)
                                        else{

                                            if(tr.length > 0){
                                                    res.status(301).json({Message:"Item already added"})
                                                }else{

                                                    conn.query(`select * from items_tb where item_id = ${item_id} ` , (e , s)=>{
                                                        
                                                        if(e) res.send(e)
                                                        else{

                                                            if(s.length > 0){
                                                                
                                                                    if( s[0].item_qty >= item_qty ){

                                                                        conn.query(`insert into store_tb(auth_id , item_id, item_price , item_discount , item_qty) values( '${success[0].auth_id}', '${s[0].item_id}' , '${s[0].item_price}' , '${s[0].item_discount}' , '${item_qty}' )` , (er , su)=>{

                                                                            if(er) res.send(er)
                                                                            else{

                                                                                let qty = s[0].item_qty - item_qty

                                                                                conn.query(`update items_tb set item_qty = ${qty} where item_id = ${item_id} ` , (fail , succ)=>{
                                                                                    if(fail) res.send(fail)
                                                                                    else{
                                                                                        res.json({Message:"Add successfully!"})
                                                                                    }
                                                                                } )

                                                                            }

                                                                        } )

                                                                    }else{
                                                                        res.status(301).json({Message:"Item have no stocks"})
                                                                    }

                                                            }
                                                            else res.status(301).json({Message:"Item not found"})

                                                        }

                                                    } )

                                                }
                                        
                                        }

                                    } )
                                }
                            
                        }

                    }else{
                             res.status(301).json({Message:"Can't add to store"})
                    }
                }
        
    } )
    

}

const  updateStore = (req , res)=>{
    const {email , password } = req.auth
    const {store_id , item_qty } = req.body

    conn.query(`select * from auth_tb  where auth_email = '${email}' ` , (error , success)=>{
        
        if(error) res.send(error)
        else{

            if(success.length > 0){

                if(!checkPassword( password , success[0].auth_password ) ) res.status(403).json({Mesage : "Not allow to increment item " })
                else{
                    
                    conn.query(`select * from store_tb where store_id = ${store_id} and auth_id = ${success[0].auth_id } ` , (err , suc)=>{

                        if(err) res.send(err)
                        else{
                            if(suc.length > 0){

                                if(item_qty > 0){

                                    if(item_qty < suc[0].item_qty ){
                                        
                                        conn.query(`select * from items_tb where item_id = ${suc[0].item_id} ` , (e ,s)=>{
                                            if(e) res.send(e)
                                            else{

                                                if(s.length > 0){
                                                    
                                                    let qty = suc[0].item_qty - item_qty
                                                    conn.query(`update items_tb set item_qty = ${qty + s[0].item_qty } where item_id = ${s[0].item_id} ` , (fail , succ)=>{
                                                        
                                                        if(fail) res.send(fail)
                                                        else{

                                                            conn.query(`update store_tb set item_qty = ${item_qty} where store_id = ${store_id} ` , (f,t)=>{

                                                                if(f) res.send(f)
                                                                else{
                                                                    res.json({Message:"Item qauntity updated successfully"})
                                                                }

                                                            } )

                                                        }

                                                    } )

                                                }else{
                                                    res.status(403).json({Message : "Something wrong"})
                                                }

                                            }
                                        } )  

                                    }
                                    else{

                                        conn.query(`select * from items_tb where item_id = ${suc[0].item_id} ` , (e ,s)=>{
                                            if(e) res.send(e)
                                            else{

                                                if(s.length > 0){
                                                    
                                                if( item_qty <= s[0].item_qty ){

                                                        let qty = (s[0].item_qty + suc[0].item_qty ) - item_qty
                                                        conn.query(`update items_tb set item_qty = ${qty} where item_id = ${s[0].item_id} ` , (fail , succ)=>{

                                                            if(fail) res.send(fail)
                                                            else{

                                                                conn.query(`update store_tb set item_qty = ${item_qty} where store_id = ${store_id} ` , (f,t)=>{
                                                                    if(f) res.send(f)
                                                                    else{
                                                                        res.status(403).json({Message : "Store updated successfully" })
                                                                    }
                                                                } )

                                                            }

                                                        } )

                                                }else{
                                                        res.status(403).json({Message:"Item have no stock"})
                                                }

                                                }else{
                                                    res.status(403).json({Message : "Something wrong"})
                                                }

                                            }
                                        } )

                                    }//

                                }else{
                                    res.status(403).json({Message :"Something wrong" })
                                }

                            }else{
                                res.status(403).json({Message:"Something wrong"})
                            }
                        }

                    } )

                }

            }else{
                res.status(403).json({Message : "Not allow to increment item qauntity " })
            }

        }

    } )

}

const getStore = (req, res)=>{
    
    const { email , password } = req.auth
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error) res.send(success)
        else{
            if(success.length > 0){

                if( checkPassword(password , success[0].auth_password) ){

                    conn.query(`select * from store_tb where auth_id = ${success[0].auth_id} ` , (er , suc)=>{
                        if(er) res.send(er)
                        else{

                            if(suc.length > 0){

                                res.json({datas:suc})

                            }else{
                                res.status(403).json({Message:"No store"})
                            }

                        }
                    } )
                }else{
                    res.status(403).json({Message : "Not allow" })
                }
            

            }else{
                res.status(301).json({Message:"Something wrong"})
            }
        } 

    } )

}

const getCustomStore = (req , res)=>{

    const { email , password } = req.auth
    const {id} = req.params

    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error) res.send(success)
        else{
            if(success.length > 0){

                if( checkPassword(password , success[0].auth_password) ){

                    conn.query(`select * from store_tb where auth_id = ${success[0].auth_id} and store_id = ${id} ` , (er , suc)=>{
                        if(er) res.send(er)
                        else{
                            if(suc.length > 0){

                                res.json({datas:suc})

                            }else{
                                res.status(403).json({Message:"No store"})
                            }

                        }
                    } )
                }else{
                    res.status(403).json({Message : "Not allow" })
                }
            

            }else{
                res.status(301).json({Message:"Something wrong"})
            }
        } 

    } )

}

const deleteStore = (req , res)=>{

    const { email , password } = req.auth
    const {id} = req.params
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error) res.send(success)
        else{
            if(success.length > 0){

                if( checkPassword(password , success[0].auth_password) ){

                    conn.query(`select * from store_tb where auth_id = ${success[0].auth_id} and store_id = ${id} ` , (er , suc)=>{
                        if(er) res.send(er)
                        else{
                            if(suc.length > 0){
                                
                                conn.query(`select * from items_tb where item_id = ${suc[0].item_id} ` , (e,s)=>{

                                    if(e) res.send(e)
                                    else{

                                        if(s.length <= 0) res.status(403).json({Message : "Not found" })
                                        else{

                                            let qty = s[0].item_qty + suc[0].item_qty
                                            conn.query(`update items_tb set item_qty = ${qty} where item_id = ${suc[0].item_id} ` , (ee ,ss)=>{

                                                if(ee) res.send(ee)
                                                else{

                                                    conn.query(`delete from store_tb where store_id = ${suc[0].store_id} and auth_id = ${success[0].auth_id} ` , (f,t)=>{

                                                        if(f) res.send(f)
                                                        else{
                    
                                                            res.json({Message : `Store deleted successfully` })
                    
                                                        }
                    
                                                    } )

                                                }

                                            } )

                                        }

                                    }

                                } )

                            }else{
                                res.status(403).json({Message:"Not allow"})
                            }

                        }
                    } )
                }else{
                    res.status(403).json({Message : "Not allow" })
                }
            

            }else{
                res.status(301).json({Message:"Something wrong"})
            }
        } 

    } )

}

module.exports = {
    createStore,
    updateStore,
    getStore,
    getCustomStore,
    deleteStore 
}