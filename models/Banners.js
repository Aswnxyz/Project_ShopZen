
const { ObjectId } = require("mongoose");
const mongoose=require("mongoose");

const BannersSchema= new mongoose.Schema({
    title: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
});


module.exports= mongoose.model("Banners",BannersSchema)