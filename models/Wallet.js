
const mongoose=require("mongoose");

const WalletSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    transactions:{
        type:[Object],
        default:[]
    }
});


module.exports= mongoose.model("Wallet",WalletSchema)