
const mongoose=require("mongoose");

const CustomerSchema= new mongoose.Schema(
    {
        name:{type:String, required:true},
        email:{type:String, required:true},
        password:{type:String, required:true},
        phone:{type:String, required:true},
        verified:Boolean,
        is_active:{type:Boolean,default:true},
        profilePic:{String},
        
    }
);


module.exports= mongoose.model("Customer",CustomerSchema)