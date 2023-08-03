
const mongoose=require("mongoose");

const ProductsSchema= new mongoose.Schema(
    {
     name:{type:String, required:true},
     description:{type:String,required:true},
     price:{type:Number,required:true},
     size:{type:String,required:true},
     color:{type:String,required:true},
     category:{type:String,required:true},
     subCategory:{type:String,required:true},
     totalQty:{type:Number,required:true},
     images:{type:Array,required:true},
     isActive:{type:Boolean,default:true}
    }
);


module.exports= mongoose.model("Products",ProductsSchema)