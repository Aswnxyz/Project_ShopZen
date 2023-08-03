
const mongoose=require("mongoose");

const WishlistSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer'
    },
    products:{
        type:Array,
        required:true
    }
});


module.exports= mongoose.model("Wishlist",WishlistSchema)