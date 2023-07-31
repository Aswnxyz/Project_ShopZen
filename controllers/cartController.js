const { query } = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const Address = require("../models/Address");
const Order = require("../models/Orders");
const ObjectId = require('mongodb').ObjectId;



module.exports = {

    getCart: async (req, res) => {
        try {
            const userId = req.session.user_id;
            // console.log(userId)
            const userCart = await Cart.findOne({ userId });

            if (!userCart) {
                return res.render('userCart', { cart: null }); // Render cart as empty if userCart is not found
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

            res.render('userCart', { cart: cartItems })


        } catch (error) {
            console.log(error.message)
        }
    },

    addToCart: async (req, res) => {
        try {
            const { productId } = req.query
            const quantity= req.query.quantity || 1
            const productObj = {
                item: productId,
                quantity: quantity
            }
            const userId = req.session.user_id;
            const userCart = await Cart.findOne({ userId: userId });
            if (userCart) {
                const prodExist = userCart.products.findIndex(products => products.item == productId);
                if (prodExist !== -1) {
                    await Cart.updateOne({ userId: userId, 'products.item': productId },
                        { $inc: { 'products.$.quantity': 1 } }
                    );
                    res.redirect('/user-cart')
                } else {
                    await Cart.updateOne({ userId: userId }, { $push: { products: productObj } });
                    res.redirect('/user-cart')
                }

            } else {
                const data = new Cart({
                    userId: userId,
                    products: [productObj]
                });
                await data.save();
                res.redirect('/user-cart')
            }


        } catch (error) {
            console.log(error.message)
        }
    },

    changeProductQuantity: async (req, res) => {
        try {
            const userId = req.session.user_id;
            const { itemId, action } = req.query;
            console.log(req.query)
            const count = Number(req.query.count);

            const data = await Cart.aggregate([
                { $match: { userId: new ObjectId(userId) } },
                { $unwind: '$products' },
                { $match: { 'products.item': itemId } },
                {
                    $project: {
                        _id: 0,
                        product: '$products.item',
                        quantity: '$products.quantity'
                    }
                }

            ]);
            console.log(data[0].quantity)

            if (action === 'increase') {
                await Cart.updateOne(
                    { userId: new ObjectId(userId), 'products.item': itemId },
                    { $inc: { 'products.$.quantity': count } }
                );
                res.status(200).json(data[0].quantity + 1)


            } else {
                if (data[0].quantity === 1) {
                    res.status(200).json(data[0].quantity)

                } else {
                    await Cart.updateOne(
                        { userId: new ObjectId(userId), 'products.item': itemId },
                        { $inc: { 'products.$.quantity': count } }
                    );
                    res.status(200).json(data[0].quantity - 1);


                }
            }
        } catch (error) {
            console.log(error.message)
        }
    },


    deleteFromCart: async (req, res) => {
        try {

            const { id } = req.query

            await Cart.updateOne(
                { userId: new ObjectId(req.session.user_id) },
                { $pull: { products: { item: id } } }
            );
            res.redirect('/user-cart')

        } catch (error) {
            console.log(error.message)
        }
    },

    // Load checkout page
    getCheckout: async (req, res) => {
        try {
            const userId = req.session.user_id;
            const userCart = await Cart.findOne({ userId });

            const cartProducts = userCart.products;
            console.log(cartProducts)
            let cartTotal= 0;
            // Fetch product details for each product in the cart
            const productsPromises = cartProducts.map(async (cartProduct) => {
                const productId = cartProduct.item;
                const productDetails = await Product.findById(productId);
                 cartTotal += productDetails.price * cartProduct.quantity
                return { item: productDetails, quantity: cartProduct.quantity};
            });



            // Wait for all product detail queries to complete
            const cartItems = await Promise.all(productsPromises);
            //Address
            const address = await Address.find({ userId });
            console.log(cartItems)

        

            res.render('checkout', { products: cartItems, address, cartTotal })
        } catch (error) {
            console.log(error.message)
        }
    },


    //Landing_Page
    getLanding: async (req,res)=>{
        try {
            res.render('order-landing-page')
        } catch (error) {
            console.log(error.message)
        }
    },

    //Place_Order
    placeOrder:async (req,res)=>{
        try {

            const userId = req.session.user_id
           console.log(req.body)
            // function to generate a unique id for order
        const generateRandomString = () => {
            const length = 12;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const {deliveryAddress,payment_option}= req.body;
        console.log(deliveryAddress)
        const address =await  Address.findOne({_id: deliveryAddress});
       
        console.log('address is : ',address);
        const deliveryDetails= {
            mobile:address.mobile,
            locality:address.locality,
            area:address.area,
            district:address.district,
            pincode:address.pincode,
            state:address.state
        };

        const products = await Cart.aggregate([
            {
                $match: { userId:new  ObjectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                  userId: 1,
                  item: { $toObjectId: '$products.item' },
                  quantity: '$products.quantity'
                }
              },
            {
                $lookup: {
                    from: 'products',
                    localField:'item' ,
                    foreignField:'_id' ,
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    _id: 0,
                    item: "$product._id",
                    quantity: 1,
                    name: "$product.name",
                    images: "$product.images",
                    price:"$product.price"
                }
            }
        ]);
        // console.log(products)

        const cartTotal = await Cart.aggregate([
            {
                $match: { userId:new  ObjectId(userId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: {$toObjectId:'$products.item'},
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            
                                
                                 $multiply: [{$toDouble:'$quantity'}, {$toDouble:'$product.price'}] 
                            
                        }
                    }
                }
            }
        ]);


        const totalPrice=cartTotal[0].total

        const orderData = new Order({
            'orderId': generateRandomString(),
                    'deliveryAddress': deliveryDetails,
                    'paymentStatus': payment_option,
                    'products': products,
                    'userId':userId,
                    'totalPrice':totalPrice,
                    'orderStatus': "pending",
                    'paymentMethod': payment_option
        });
        await orderData.save();

        
for (let i = 0; i < products.length; i++) {
    await Product.updateOne(
      { _id: new ObjectId(products[i].item) },
      { $inc: { totalQty: -products[i].quantity } } // Corrected access to the quantity value
    );
  }
        

        await Cart.deleteOne({userId:userId});
        
        } catch (error) {
            console.log(error.message)
        }
    },



}