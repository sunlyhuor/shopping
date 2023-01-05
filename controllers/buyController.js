const bcrypt = require("bcrypt")
const {conn} = require("../model/Database")


const checkPassword = (pass , password)=>{
    let check = bcrypt.compareSync(pass , password)
    return check
}

const createBuy = (req , res)=>{
    const { email , password } = req.auth
    const { store_id , payment_id , payment_code  } = req.body
    
    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error) res.send(error)
        else{

            if(success.length > 0){

                if(!checkPassword(password , success[0].auth_password)){
                    res.status(403).json({Messaage : "Not allow" })
                }else{

                    store_id.forEach((v)=>{
                        
                        conn.query(`select * from store_tb s INNER JOIN items_tb t on t.item_id = s.item_id where store_id = ${v} and s.auth_id = ${success[0].auth_id} ` , (err , succ)=>{

                            if(err) res.send(err)
                            else{

                                if(succ.length > 0){
                                    let total = succ[0].item_qty * succ[0].item_price
                                    conn.query(`insert into bought_tb(store_id , payment_id , payment_code , bought_total , bought_qty , item_title , auth_id , item_id ) values( '${v}' , '${payment_id}' , '${payment_code}' , '${total}' , '${succ[0].item_qty}' , '${succ[0].item_title}' , '${success[0].auth_id}' , ${succ[0].item_id} ) ` , (er , suc)=>{

                                        if(er) res.send(err)
                                        else{

                                            conn.query(`delete from store_tb where store_id = ${v} and auth_id = ${success[0].auth_id} ` , (f , t)=>{

                                                if(f) res.send(f)
                                                else{

                                                        if(v == store_id[store_id.length - 1] ){

                                                            res.json({Message : "Bought successfully" })
                                                        
                                                        } 

                                                }

                                            } )

                                        }
                                    } )

                                }else{

                                    res.status(403).json({Message : "Not found" })

                                }

                            }

                        } )
                        
                    })
                    // res.json({Message:"Bought successfully" })


                }

            }else{

                res.status(403).json({Message : "Something wrong" })

            }

        }

    } )


}

const deleteBuy = (req , res)=>{

    const { email , password } = req.auth
    const {id} = req.params

    conn.query(`select * from auth_tb where auth_email = '${email}' ` , (error , success)=>{

        if(error) res.send(error)
        else{

            if(success.length > 0){

                if(!checkPassword(password , success[0].auth_password)){
                    res.status(403).json({Message:"Not allow"})
                }else{

                    conn.query(`select * from bought_tb b INNER join items_tb t on t.item_id = b.item_id where b.bought_id = ${id} and b.auth_id = ${success[0].auth_id}` , (err , succ)=>{
                       
                        if(err) res.send(err)
                        else{

                            if(succ.length > 0){

                                if( succ[0].bought_processing == "Processing" || succ[0].bought_processing == "processing" ){
                                    
                                    let qty = succ[0].item_qty + succ[0].bought_qty
                                    // res.json({qty:qty})
                                    conn.query(`update items_tb set item_qty = ${qty} where item_id = ${succ[0].item_id} ` , (ee , ss)=> {

                                        if(ee) res.send(ee)
                                        else{

                                             conn.query(`delete from bought_tb where bought_id = ${id} and auth_id = ${success[0].auth_id} ` , (e , s)=>{

                                                if(e) res.send(e)
                                                else res.json({Message:"Delete successfully"})

                                            } )

                                        }
                                        
                                    } )
                                   

                                }else{
                                    res.status(403).json({Message:"Not allow"})
                                }

                            }
                            else{
                                res.status(403).json({Message:"Not allow"})
                            }

                        }
                        
                    } )

                }

            }else{

                res.status(403).json({Message:"Something wrong"})

            }

        }

    } )

}

module.exports = {
    createBuy,
    deleteBuy
}

