
const mongoose=require("mongoose");

const CartSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer'
    },
    products:{
        type:Array,
        required:true
    }
});


module.exports= mongoose.model("Cart",CartSchema)