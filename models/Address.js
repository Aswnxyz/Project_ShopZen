
const mongoose=require("mongoose");

const AddressSchema= new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        }
        
    }
);


module.exports= mongoose.model("Address",AddressSchema)