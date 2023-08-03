const session = require('express-session');
const Wishlist = require('../models/Wishlist');
const ObjectId = require('mongodb').ObjectId;

const wishlistCountMiddelware =async  (req,res,next)=>{
    try {
        if (req.session.user_id){
            const wishlist = await Wishlist.findOne({userId: new ObjectId(req.session.user_id)});
            if (wishlist){
                if( wishlist.products.length > 0)
                res.locals.wishlistCount = wishlist.products.length
                
            }
           
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
  
};

module.exports= {
    wishlistCountMiddelware
}