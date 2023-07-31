const session = require('express-session');
const Cart = require('../models/Cart');
const ObjectId = require('mongodb').ObjectId;

const cartCountMiddelware =async  (req,res,next)=>{
    try {
        if (req.session.user_id){
            const cart = await Cart.findOne({userId: new ObjectId(req.session.user_id)});
            if (cart){
                if( cart.products.length > 0)
                res.locals.cartCount = cart.products.length
                
            }
           
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
  
};

module.exports= {
    cartCountMiddelware
}