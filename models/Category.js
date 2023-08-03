
const mongoose=require("mongoose");

const CategorySchema= new mongoose.Schema(
    {
      name: {
        type: String
    },
    subCategory: {
        type: [String]
    },
    isActive:{
        type:Boolean,
        default:true
    },
    }
);


module.exports= mongoose.model("Category",CategorySchema)