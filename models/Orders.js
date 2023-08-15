
const mongoose=require("mongoose");

const OrdersSchema= new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        deliveryAddress: {
            type: Object,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        },
        products: {
            type: Object,
            required: true
        },
        paymentStatus: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        orderStatus: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        couponSaving:{
            type:Number,
            required:true
        }
    }
);


module.exports= mongoose.model("Orders",OrdersSchema)