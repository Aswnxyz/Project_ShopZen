const { query } = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const Address = require("../models/Address");
const Order = require("../models/Orders");
const { json } = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
  getCart: async (req, res) => {
    try {
      const userId = req.session.user_id;
      // console.log(userId)
      const userCart = await Cart.findOne({ userId });

      if (!userCart) {
        return res.render("userCart", { cart: null }); // Render cart as empty if userCart is not found
      }

      const cartProducts = userCart.products;

      // Fetch product details for each product in the cart
      const productsPromises = cartProducts.map(async (cartProduct) => {
        const productId = cartProduct.item;
        const productDetails = await Product.findById(productId);
        return { item: productDetails, quantity: cartProduct.quantity };
      });

      // Wait for all product detail queries to complete
      const cartItems = await Promise.all(productsPromises);
      // console.log(cartItems)

      res.render("userCart", { cart: cartItems });
    } catch (error) {
      console.log(error.message);
    }
  },

  //Add_To_Cart
  addToCart: async (req, res) => {
    try {

      console.log('-=-=-=--=',req.query)
      const { productId,size } = req.query;
      console.log(productId);
      const quantity = parseFloat(req.query.quantity || 1);
      const productObj = {
        item: productId,
        quantity: quantity,
        size:size
      };
      const limitedQuantity = Math.min(quantity, 10);

      const userId = req.session.user_id;
      const userCart = await Cart.findOne({ userId: userId });
      const product=await Product.findOne({_id:new ObjectId(productId)});
      console.log('product_Here::::',product)
      if (userCart) {
        const prodExist = userCart.products.findIndex(
          (products) => products.item == productId
        );
        if (prodExist !== -1) {
          const newTotalQuantity = userCart.products[prodExist].quantity + limitedQuantity;

          
        if (newTotalQuantity <= 10 && newTotalQuantity <= product.totalQty) {
          // Update quantity in cart
          await Cart.updateOne(
            { userId: userId, "products.item": productId },
            { $set: { "products.$.quantity": newTotalQuantity } }
          );
          const newCart = await Cart.findOne({ userId: userId });
          const cartCount = newCart.products.length;
          if (req.xhr) {
            res.json({ status: true, cartCount });
          } else {
            res.redirect("/user-cart");
          }
        } else {
          if (req.xhr) {
          // Respond with an error message if quantity exceeds limit
          res.json({ status: false, message: "Quantity exceeds limit" });
          return;
          }else{
            res.redirect("/user-cart")
          }


        }

          // await Cart.updateOne(
          //   { userId: userId, "products.item": productId },
          //   { $inc: { "products.$.quantity": 1 } }
          // );
       
        } else {
          await Cart.updateOne(
            { userId: userId },
            { $push: { products: productObj } }
          );
          const newCart = await Cart.findOne({ userId: userId });
          const cartCount = newCart.products.length;
          if (req.xhr) {
            res.json({ status: true, cartCount });
          } else {
            res.redirect("/user-cart");
          }
        }
      } else {
        const data = new Cart({
          userId: userId,
          products: [productObj],
        });
        await data.save();
        const newCart = await Cart.findOne({ userId: userId });
        const cartCount = newCart.products.length;
        if (req.xhr) {
          res.json({ status: true, cartCount });
        } else {
          res.redirect("/user-cart");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  //Change_Quantity
  changeProductQuantity: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const { itemId, action } = req.query;
      console.log(req.query);
      const count = Number(req.query.count);

      const data = await Cart.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: "$products" },
        { $match: { "products.item": itemId } },
        {
          $project: {
            _id: 0,
            product: "$products.item",
            quantity: "$products.quantity",
          },
        },
      ]);
      console.log(data[0].quantity);

      if (action === "increase") {
        await Cart.updateOne(
          { userId: new ObjectId(userId), "products.item": itemId },
          { $inc: { "products.$.quantity": count } }
        );
        res.status(200).json(data[0].quantity + 1);
      } else {
        if (data[0].quantity === 1) {
          res.status(200).json(data[0].quantity);
        } else {
          await Cart.updateOne(
            { userId: new ObjectId(userId), "products.item": itemId },
            { $inc: { "products.$.quantity": count } }
          );
          res.status(200).json(data[0].quantity - 1);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  //Delete_from_Cart
  deleteFromCart: async (req, res) => {
    try {
      const { id } = req.query;

      await Cart.updateOne(
        { userId: new ObjectId(req.session.user_id) },
        { $pull: { products: { item: id } } }
      );
      res.redirect("/user-cart");
    } catch (error) {
      console.log(error.message);
    }
  },

  // Load checkout page
  getCheckout: async (req, res) => {
    try {
      const userId = req.session.user_id;
      const userCart = await Cart.findOne({ userId });

      const cartProducts = userCart.products;
      console.log(cartProducts);
      let cartTotal = 0;
      // Fetch product details for each product in the cart
      const productsPromises = cartProducts.map(async (cartProduct) => {
        const productId = cartProduct.item;
        const productDetails = await Product.findById(productId);
        if(productDetails.totalQty < cartProduct.quantity){
          res.redirect('/user-cart')
        }
        cartTotal += productDetails.price * cartProduct.quantity;
        return { item: productDetails, quantity: cartProduct.quantity };
      });

      // Wait for all product detail queries to complete
      const cartItems = await Promise.all(productsPromises);
      //Address
      const address = await Address.find({ userId });
      console.log(cartItems);

      res.render("checkout", { products: cartItems, address, cartTotal });
    } catch (error) {
      console.log(error.message);
    }
  },

  //Landing_Page
  getLanding: async (req, res) => {
    try {
      res.render("order-landing-page");
    } catch (error) {
      console.log(error.message);
    }
  },

  //Place_Order
  placeOrder: async (req, res) => {
    try {
      const userId = req.session.user_id;
      console.log(req.body);
      // function to generate a unique id for order
      const generateRandomString = () => {
        const length = 12;
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };


      const { deliveryAddress, payment_option } = req.body;
      const paymentStatus =payment_option === 'COD' ? 'pending' : 'processing';
      let deliveryDetails;
      if(deliveryAddress){
      const address = await Address.findOne({ _id: deliveryAddress });
       deliveryDetails = {
        mobile: address.mobile,
        locality: address.locality,
        area: address.area,
        district: address.district, 
        pincode: address.pincode,
        state: address.state,
      };
    }else{
      return res.status(404).json({err:true})
    }

      const products = await Cart.aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            userId: 1,
            item: { $toObjectId: "$products.item" },
            quantity: "$products.quantity",
            size: "$products.size"
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            _id: 0,
            item: "$product._id",
            quantity: 1,
            size:1,
            name: "$product.name",
            images: "$product.images",
            price: "$product.price",
          },
        },
      ]);
      // console.log(products)

      const cartTotal = await Cart.aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: { $toObjectId: "$products.item" },
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  { $toDouble: "$quantity" },
                  { $toDouble: "$product.price" },
                ],
              },
            },
          },
        },
      ]);

      const totalPrice = cartTotal[0].total;
      const orderId=generateRandomString()
      const orderData = new Order({
        orderId:orderId ,
        deliveryAddress: deliveryDetails,
        paymentStatus: paymentStatus,
        products: products,
        userId: userId,
        totalPrice: totalPrice,
        orderStatus: "pending",
        paymentMethod: payment_option,
      });
      await orderData.save();
      console.log(orderData)

     

      if(payment_option=== 'Razorpay'){
        //Generate_Razorpay  
        var options = {
            amount: totalPrice*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: orderId
        };
        instance.orders.create(options, function(err, order) {
            console.log('New Order : ',order);
            res.json({paymentOption: 'Razorpay',order})
        });


      }else if(payment_option === "COD"){
        for (let i = 0; i < products.length; i++) {
          await Product.updateOne(
            { _id:new ObjectId(products[i].item) },
            { $inc: { totalQty: -products[i].quantity } } // Corrected access to the quantity value
          );
        }
  
        await Cart.deleteOne({ userId: userId });

        res.json({paymentOption: 'COD'})
      }

    } catch (error) {
      res.status(404).json({paymentFailed:true})
      console.log(error.message);
    }
  },

  //Verify_Payment
  verifyPayment:async (req,res)=>{
    try {
        const {payment,order}=req.body
        console.log(payment,order);

        const products = await Order.aggregate([
          {
            $match: { orderId: order.receipt },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              userId: 1,
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              _id: 0,
              item: "$product._id",
              quantity: 1,
              size:1,
              name: "$product.name",
              images: "$product.images",
              price: "$product.price",
            }, 
          },
        ]);



       const crypto = require('crypto');
       const hmac = crypto.createHmac('sha256', 'vzBBPFl2ZfvGHmiN6LOIAwn1')
       .update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
       .digest('hex');

       if(hmac == payment.razorpay_signature){
        await Order.updateOne(
            {orderId:order.receipt},
            {$set:{paymentStatus:'completed'}}
        );
        for (let i = 0; i < products.length; i++) {
          await Product.updateOne(
            { _id:new ObjectId(products[i].item) },
            { $inc: { totalQty: -products[i].quantity } } // Corrected access to the quantity value
          );
        }
  
        await Cart.deleteOne({ userId: req.session.user_id });
        res.json({status:true})
       }else{
        res.json({status:false})
       }
    } catch (error) {
        console.log(error.message)
    }
  }
};
 