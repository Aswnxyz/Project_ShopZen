const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const mongoose=require("mongoose");

const CouponsSchema= new mongoose.Schema(
    {
      code:{type:String},
      amount:{type:Number},
      expiresOn:{type:Date},
      minPurchase:{type:Number}
    }
);


module.exports= mongoose.model("Coupons",CouponsSchema)