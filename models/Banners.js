const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const mongoose=require("mongoose");

const BannersSchema= new mongoose.Schema(
    {
       imageURL:{type:String},
       bannerName:{type:String}
    }
);


module.exports= mongoose.model("Banners",BannersSchema)