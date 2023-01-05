const {conn} = require("../model/Database")

const getCategory = (req , res)=>{
    conn.query("select * from categories_tb" , (err , suc)=>{
        if( err ) res.send(err)
        else res.json({datas : suc})

    })
}

module.exports = {
    getCategory
}
