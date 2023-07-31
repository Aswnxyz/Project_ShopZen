const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const { ObjectId } = require("mongoose");
const mongoose=require("mongoose");

const AdminSchema= new mongoose.Schema(
    {
    email:{type:String},
    password:{type:String}
    }
);


module.exports= mongoose.model("Admin",AdminSchema)