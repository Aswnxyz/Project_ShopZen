const Address =require('../models/Address')
const Customer =require('../models/Customer');
const Wallet =require('../models/Wallet');
const Cart =require('../models/Cart');
const bcrypt= require('bcrypt');
const { cartCountMiddelware } = require('../middleware/cartCount');
const { ObjectId } = require('mongodb');


module.exports={

    getProfile : async (req,res)=>{
        try {
            const userId = req.session.user_id;
            const addressData= await Address.find({userId:userId})
            const userData= await Customer.findById({_id:userId});
            res.render('profile',{user:{userData,addressData}})
        } catch (error) {
            console.log(error.message)
        }
    },

    getAddress: async(req,res)=>{
        try {
            res.render('add-address')
        } catch (error) {
            console.log(error.message)
        }
    },

    postAddress: async (req,res)=>{
        try {
            const {checkout} = req.query;
            console.log(req.query)
            const id=req.session.user_id
            const {name,email,mobile,area,locality,district,state,pincode}=req.body
            const data =new Address({
                name,
                email,
                mobile,
                area,
                district,
                state,
                pincode,
                locality,
                userId:id
            });
            await data.save();
            if(checkout === 'true'){
                res.redirect('/user-checkout')
            }else{
                res.render('add-address',{message:'Address added successfully.'});
            }

        } catch (error) {
            console.log(error.message)
        }
    },

    //delete_address
    deleteAddress: async (req,res)=>{
        try {
            
            const {addressId}= req.query
            console.log(addressId);
            await Address.deleteOne({_id:addressId})
            res.status(200).json({success:true})
        } catch (error) {
            console.log(error.message)
        }
    },

    getChangePassword:async (req,res)=>{
        try {
            res.render('changePassword')
        } catch (error) {
            console.log(error.message)
        }
    },


    
postChangePassword: async (req, res) => {
    try {
        const { password, newPassword, confirmPassword } = req.body;
        console.log(req.body);

        const userData = await Customer.findById(req.session.user_id);
        if (!userData) {
            console.log("User data not found!");
            res.render('changePassword', { message: "User data not found!" });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);
        console.log("Password Match:", passwordMatch);

        if (!passwordMatch) {
            res.render('changePassword', { message: "Incorrect Password!" });
        } else {
            if (newPassword !== confirmPassword) {
                res.render('changePassword', { notMatch: "Password doesn't match!" });
            } else {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await Customer.updateOne(
                    { _id: userData._id },
                    { password: hashedPassword }
                );
                res.redirect('/profile');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
},

getEditProfile:async (req,res)=>{
    try {
        const userId=req.session.user_id
        const {message}=req.query
        console.log(userId);
        const userData= await Customer.findById({_id: userId});
        console.log(userData)
        res.render('editProfile',{userData,message})
    } catch (error) {
        console.log(error.message)
    }
},

postEditProfile: async (req,res)=>{
    try {
        // console.log(req.body)
        const userId= req.session.user_id
        await Customer.updateOne(
            { _id: userId },
            {$set:{
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
            }}
        );
        console.log('here non issue')
            res.redirect(`/edit-profile?message=Profile Edited Successfully.`)

    } catch (error) {
        console.log(error.message)
    }
},

//Get_User_Wallet
getWallet: async (req,res)=>{
    try {
        const userId= req.session.user_id;
        const wallet = await Wallet.findOne({userId:new ObjectId(userId)}).lean();
        const transactions= wallet?.transactions.reverse()
        console.log(transactions)
        res.render('userWallet',{wallet,transactions})
    } catch (error) {
        console.log(error.message)
    }
},

//Get_Wallet_details
getWalletDetails: async (req,res)=>{
    try {
        let couponSaving;
        if(req.body.couponSaving){
            couponSaving=req.body.couponSaving
        }
        const userId = req.session.user_id
        console.log(userId)
        const wallet = await Wallet.find({userId:userId}).lean();
        let walletTotal;
        if(!wallet.length){
            const newWallet = new Wallet({
                userId: new ObjectId(userId),
                balance: 0,
                transactions: [] // Create new array with the new transaction
              })
              await newWallet.save();
              walletTotal=0
        }else{
            walletTotal = wallet[0].balance
        }
       
        

        console.log('wallaert ', walletTotal)
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
          console.log(cartTotal)
              const totalPrice = cartTotal[0].total
              res.json({walletTotal,cartTotal:totalPrice})

    } catch (error) {
        console.log(error.message)
    }
}


}