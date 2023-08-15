
const { ObjectId } = require("mongoose");
const mongoose=require("mongoose");

const CouponsSchema= new mongoose.Schema({
  code:{
    type:String,
    required:true,
    unique:true
  },
  discountPercentage:{
    type:Number,
    required:false,
    min:0,
    max:100
  },
  maxDiscount:{
    type:Number,
    required:true,
    min:0
  },
  minAmount:{
    type:Number,
    required:true,
    min:0
  },
  description:{
    type:String,
    required:true,
  },
  expirationDate:{
    type:Date,
    required:true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  }],
});


module.exports= mongoose.model("Coupons",CouponsSchema)