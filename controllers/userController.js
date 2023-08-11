const Customer = require("../models/Customer");
const UserOTPVerification = require("../models/UserOTPVerification");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Category = require("../models/Category");
const Products = require("../models/Products");
const Orders = require("../models/Orders");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const { query } = require("express");
const { ObjectId } = require("mongodb");
const { json } = require("body-parser");


const getHome = async (req, res) => {
  try {
    console.log(process.env.SHOPZEN_EMAIL)
    const categories = await Category.find({});
    const successMessage = req.session.successMessage;
    if (successMessage) {
      // Clear the success message from the session to prevent showing it again on page refresh
      delete req.session.successMessage;
    }
    res.render("home", { successMessage, categories }); // Pass the successMessage to the view
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const sendVerifyMail = async (name, email, userId) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SHOPZEN_EMAIL,
        pass: process.env.SHOPZEN_PASSWORD,
      },
    });

    const mailOptions = {
      from: "shopzen105@gmail.com@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `Dear ${name},\n\nEnter <b>${otp}</b> in the app to verify you email address and complete the process.`,
    };

    const newOTPverification = new UserOTPVerification({
      user_Id: userId,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 120000,
    });
    await newOTPverification.save();

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

const insertUser = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    console.log(email);
    const userData = await Customer.findOne({ email: email, verified: true });
    if (userData) {
      res.render("signUp", { message: "Email already exists" });
    } else {
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        res.render("signUp", {
          message: "Passwords do not match. Please try again.",
        });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new Customer({
          name: req.body.firstName + " " + req.body.lastName,
          email: req.body.email,
          phone: req.body.mobile,
          password: hashedPassword,
          verified: false,
        });
        const savedUser = await newUser.save();
        console.log(savedUser);
        sendVerifyMail(req.body.firstName, req.body.email, savedUser._id);
        res.render("otpVerification", { savedUser });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { user_Id, otp } = req.body;
    console.log("otp  :", req.body);
    if (!user_Id || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerficationRecords = await UserOTPVerification.find({
        user_Id,
      });
      // console.log('userotp records', UserOTPVerficationRecords)
      if (UserOTPVerficationRecords.length <= 0) {
        throw new Error("account records doesn,t exist ");
      } else {
        const { expiresAt } = UserOTPVerficationRecords[0];
        const currentOtp = UserOTPVerficationRecords[0].otp;
        console.log(currentOtp);

        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteMany({ user_Id });
          throw new Error("Code has been expired .Please request again.");
        } else {
          if (otp !== currentOtp) {
            const savedUser = await Customer.findOne({ _id: user_Id });
            console.log(savedUser);
            res.render("otpVerification", {
              savedUser,
              message: "Invalid OTP !",
            });
            // res.send('invalid')
            throw new Error("Invalid code passed .Check your inbox. ");
          } else {
            await Customer.updateOne({ _id: user_Id }, { verified: true });
            await UserOTPVerification.deleteMany({ user_Id });
            req.session.user_id = user_Id;
            req.session.successMessage = "Registration successfully!";
            res.redirect("/");
          }
        }
      }
    }
  } catch (error) {
    console.log("its here");
    console.log(error.message);
  }
};

const resendOTPVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const savedUser = await Customer.findOne({ email: email });
    console.log(savedUser._id);
    await UserOTPVerification.deleteMany({ user_Id: savedUser._id });
    sendVerifyMail(savedUser.firstName, savedUser.email, savedUser._id);
    res.render("otpVerification", { savedUser });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await Customer.findOne({ email: email, is_active:true });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user_id = userData.id;
        req.session.successMessage = "Logged in successfully!"; // Set the success message in the session

        res.redirect("/");
      } else {
        res.render("login", {
          title: "Invalid Password",
          message: "Invalid Password",
        });
      }
    } else {
      res.render("login", {
        title: "Inalid Email and Password",
        message: "Invalid Email and Password",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await Customer.findOne({ email: email });
    console.log(userData);
    if (userData) {
      if (!userData.verified) {
        res.render("forgotPassword", { message: "Unverified User" });
      } else {
        console.log("userId ", userData._id);
        sendVerifyMail(userData.firstName, userData.email, userData._id);
        res.render("forgotOtp", { userId: userData._id });
        // res.render('forgotOtp',{userData})
      }
    } else {
      res.render("forgotPassword", { message: "Invalid User" });
    }
    // if(!userData.verified){
    //     res.render('forgotPassword',{message:"Invalid User"})
    // }else{
    //     sendVerifyMail(userData.name,userData.email,userData._id);
    //     res.render('forgotOtp',{userId:userData._id})
  } catch (error) {
    console.log(error.message);
  }
};

const forgotOTPVerification = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log(userId);
    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const UserOTPVerficationRecords = await UserOTPVerification.find({
        user_Id: userId,
      });
      if (UserOTPVerficationRecords.length <= 0) {
        throw new Error("account records doesn,t exist ");
      } else {
        const { expiresAt } = UserOTPVerficationRecords[0];
        const currentOtp = UserOTPVerficationRecords[0].otp;
        console.log(currentOtp);

        if (expiresAt < Date.now()) {
          await UserOTPVerification.deleteMany({ user_Id: userId });
          res.render("forgotOtp", {
            userId: userId,
            message: "Code has been expired .Please request again!",
          });
          // throw new Error("Code has been expired .Please request again.",)
        } else {
          if (otp !== currentOtp) {
            // res.send('invalid')
            res.render("forgotOtp", {
              message: "Invalid code passed!",
              userId: userId,
            });
            // throw new Error("Invalid code passed .Check your inbox. ")
          } else {
            await UserOTPVerification.deleteMany({ user_Id: userId });
            console.log("new passsword : userID", userId);
            res.render("newPassword", { userId: userId });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      res.render("newPassword", {
        message: "New password and confirm password do not match !",
        userId: userId,
      });
    } else {
      const newPassword = await bcrypt.hash(confirmPassword, 10);
      await Customer.updateOne({ _id: userId }, { password: newPassword });
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    req.session.successMessage = "Logout successfully!";
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// const getProducts = async (req, res) => {
//   try {
//     const { category } = req.query;
//     let subCategory='';
//     if(req.query.subCategory){
//       subCategory=req.query.subCategory
//     }
//     const data = await Products.find({
//        category: category
//       });
//     res.render("products", { data });
//   } catch (error) {
//     console.log(error.message);
//   }
// };


//Search_Products
const productSearch=async (req,res)=>{
  try {

  
      const search=req.query.search
    
      const data = await Products.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { name: { $regex: '.*' + search + '.*', $options: 'i' } },
              { category: { $regex: '.*' + search + '.*', $options: 'i' } },
              { subCategory: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
          }
        },
        {
          $group: {
            _id: "$name",
            firstProduct: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$firstProduct" }
        }
      ]);
      
    if (!data.length){
      res.render('no-products-found')
    }else{
      const uniqueCategoryNames = [...new Set(data.map(item => item.category))];

      // Query categories based on the unique category names
      const categoryList = await Category.find({ name: { $in: uniqueCategoryNames } });
  
      res.render("products", { data,categoryList });
    }
 
    
  } catch (error) {
    console.log(error.message)
  }
}

//Get_Products
const getProducts = async (req, res) => {
  try {

    const {sort}=req.query;
    console.log(req.query)
    console.log('BODY :::',req.body)
    const priceLimit = req.body.price

    const { category } = req.query;
    const query = { category: category };
    query.isActive=true;

  let subCategory = '';
  
  if (req.query.subCategory) {
    subCategory = req.query.subCategory;
  }

  let subCategories = [];

  if (req.body.subCategory) {
    if (Array.isArray(req.body.subCategory)) {
      subCategories = req.body.subCategory;
    } else {
      subCategories = [req.body.subCategory];
    }
  }
  
  if (subCategories.length > 0) {
    query.subCategory = { $in: subCategories };
  }

  
  
  // Construct the query object based on the presence of subCategory and filtered price
  
  if (subCategory) {
    query.subCategory = subCategory;
  }
  
  if(priceLimit){
  // Step 1: Remove the currency symbol (₹) and any spaces
  const sanitizedParams = priceLimit.replace(/₹|\s/g, '');
  // Step 2: Split the sanitizedParams at the hyphen
  const priceRange = sanitizedParams.split('-');
  
  // Step 3: Convert the resulting substrings into numbers
  const minPrice = parseInt(priceRange[0], 10);
  const maxPrice = parseInt(priceRange[1], 10);

  query.price = { $gte: minPrice, $lte: maxPrice };

  }
  
  console.log('query::', query)
  // const data = await Products.find(query);

  const page = parseInt(req.query.page) || 1;
  const perPage = 8;

  // Build the aggregation pipeline
  const aggregationPipeline= [
    {
      $match: query
    },
    {
      $group: {
        _id: "$name",
        firstProduct: { $first: "$$ROOT" }
      }
    },
    {
      $replaceRoot: { newRoot: "$firstProduct" }
    }
  ];

  if (sort === 'hightToLow') {
    aggregationPipeline.push({ $sort: { price: -1 } }); // Sort by price high to low
  } else if (sort === 'lowToHigh') {
    aggregationPipeline.push({ $sort: { price: 1 } }); // Sort by price low to high
  }


const data = await Products.aggregate(aggregationPipeline)
const totalProducts= data.length;
const totalPages = Math.ceil(totalProducts / perPage);


  
  if (data.length === 0) {
    // Render the "No products found" page
    if(req.xhr){
      return res.json({data})

    }
    return res.render("no-products-found");
  }

  const categoryList= await Category.find({name:category});
  // console.log('categoryList:',categoryList)
  if(req.xhr){
    return res.json({data, categoryList})
  }
  res.render("products", { data, categoryList });
  
   
  } catch (error) {
    console.log(error.message);
  }
};



//View_Products
const viewProduct = async (req, res) => {
  try {
    console.log('rqueryyyyy',req.query)
    let {id} = req.query;
    const product = await Products.findById({ _id: id });
    console.log("PRODUCTTTTTTTTT:",product)
    const wishlist= await Wishlist.findOne({userId:new ObjectId(req.session.user_id)});
    console.log('wishlist::::', wishlist)
    const data = await Products.find({name:product.name, totalQty: { $gte: 1 }},{_id:0,size:1})
    const sizeData = data.map(sizeObj => sizeObj.size);
    res.render("productDetails", { product, wishlist,sizeData });

  } catch (error) {
    console.log(error.message);
  }
};

//orders_page
const getOrders = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalOrders = await Orders.find({userId:new ObjectId(userId), paymentStatus: { $ne: "processing" }}).count()
    const totalPages = Math.ceil(totalOrders / perPage);

    let search = "";
    if (req.query.orderId) {
        search = req.query.orderId
    }

    const orders = await Orders.find({
       userId: new ObjectId(userId) ,
       paymentStatus: { $ne: "processing" },
       $or: [
        { orderId: { $regex: '.*' + search + '.*', $options: 'i' } },   
    ]
      })
    .sort({ createdAt: -1 }) // Assuming you want to sort by creation date in descending order
    .skip((page - 1) * perPage)
    .limit(perPage);

    const startingIndex = (page - 1) * perPage + 1;
   
    res.render("orders", { orders, totalPages, currentPage:page, startingIndex });
  } catch (error) {
    console.log(error.message);
  }
};

// order_details-page
const OrderDetails = async (req, res) => {
  try {
    const { orderId } = req.query;
    const details = await Orders.find({ orderId: orderId });
    const orderDetails = JSON.parse(JSON.stringify(details));
    const products = await Orders.aggregate([
      {
        $match: { orderId: orderId },
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
    ]);

    res.render("orderDetails", { orderDetails, products });
  } catch (error) {
    console.log(error.message);
  }
};

//Order_Cancel
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const newStatus = "cancelled";
    await Orders.updateOne(
      { orderId: orderId },
      { $set: { orderStatus: newStatus } }
    );

    const products= await Orders.aggregate([
      {$match:{ orderId: orderId }},
      {$unwind:'$products'},
      {$project:{
        item:'$products.item',
        quantity:'$products.quantity'
      }}
    ]);
    console.log('PRODUCTS::::::',products);

    for (let i = 0; i < products.length; i++) {
      await Products.updateOne(
        { _id: new ObjectId(products[i].item) },
        { $inc: { totalQty: products[i].quantity } } // Corrected access to the quantity value
      );
    }

    res.json({ res: true });
  } catch (error) {
    console.log(error.message);
  }
};


//Return_Order
const returnOrder=async (req,res)=>{
  try {
    const { orderId } = req.body;
    const newStatus = "returned";
    await Orders.updateOne(
      { orderId: orderId },
      { $set: { orderStatus: newStatus } }
    );

    const products= await Orders.aggregate([
      {$match:{ orderId: orderId }},
      {$unwind:'$products'},
      {$project:{
        item:'$products.item',
        quantity:'$products.quantity'
      }}
    ]);
    console.log('PRODUCTS::::::',products);

    for (let i = 0; i < products.length; i++) {
      await Products.updateOne(
        { _id: new ObjectId(products[i].item) },
        { $inc: { totalQty: products[i].quantity } } // Corrected access to the quantity value
      );
    }

    res.json({ res: true });
  } catch (error) {
    console.log(error.message)
  }

}

//Wishlist
const getWishlist=async (req,res)=>{
  try {
    const products = await Wishlist.aggregate([
      { $match: { userId: new ObjectId(req.session.user_id) } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
            {
              $project: {
                _id: 1,
                item: "$_id",
                quantity: "$totalQty",
                name: 1,
                images: 1,
                price: 1,
                description:1,
                size:1
              }
            }
          ],
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          item: "$product.item",
          quantity: "$product.quantity",
          name: "$product.name",
          images: "$product.images",
          price: "$product.price",
          description: "$product.description",
          size:"$product.size"
        }
      }
    ]);
    console.log(products)
    res.render('wishlist',{products})
  } catch (error) {
    console.log(error.message)
  }
}

//Add_To_Wishlist
const addToWishlist= async (req,res)=>{
  try {
    console.log('coming on wishlist')

    const {productId}=req.query;
    const userId = req.session.user_id;
    const userData = await Wishlist.findOne({userId:new ObjectId(userId)});
    if(userData){
      if(userData.products.includes(productId)){
        await Wishlist.updateOne(
          {userId:new ObjectId(userId)},
          {$pull:{products:productId}}
        );
        const newWishlist = await Wishlist.findOne({userId:new ObjectId(userId)});
        const wishlistLength=newWishlist.products.length;
        res.json({status:false,wishlistLength})
      }else{
      userData.products.push(productId)
      await userData.save();
    const wishlistLength=userData.products.length;
      res.json({status:true,wishlistLength})
      }


    }else{
      const newWishlist = new Wishlist({
        userId:userId,
        products:[productId]
      });
      await newWishlist.save();
      const wishlistLength=newWishlist.products.length;
      res.json({status:true,wishlistLength})
    }


  } catch (error) {
    console.log(error.message)
  }
}

//Delete_Wishlist
const deleteWishlist= async (req,res)=>{
  try {
    const {productId}=req.body;
    const userId= req.session.user_id
    console.log('product id ::::',productId)
    await Wishlist.updateOne(
      {userId:new ObjectId(userId)},
      {$pull:{products:productId}}
    );
    const updatedWishlist= await Wishlist.findOne();
    const wishlistLength=updatedWishlist.products.length;
    res.json({ message: "Product deleted successfully" ,wishlistLength});
  } catch (error) {
    console.log(error.message)
  }
}


const error = async(req,res)=>{
  try {
    res.render('page-404')
  } catch (error) {
    
  }
}



module.exports = {
  getHome,
  loginLoad,
  insertUser,
  verifyOTP,
  resendOTPVerificationCode,
  verifyLogin,
  forgotVerify,
  forgotOTPVerification,
  verifyPassword,
  productSearch,
  getProducts,
  userLogout,
  viewProduct,
  getOrders,
  OrderDetails,
  cancelOrder,
  returnOrder,
  getWishlist,
  addToWishlist,
  deleteWishlist,
  error
  
};
