const express=require('express');
const userRoute=express();
const session=require('express-session');
const userController=require('../controllers/userController');
const userProfileController=require('../controllers/userProfileController');
const cartController=require('../controllers/cartController');
const expressLayouts=require('express-ejs-layouts')
userRoute.use(expressLayouts)
const sessionHandling=require('../middleware/session-handling')
const isLoggedIn=require('../middleware/isLoggedIn')
const cartCount=require('../middleware/cartCount');
const wishlistCount=require('../middleware/wishlistCount');
// userRoute.use(isLoggedIn.isLoggedInMiddleware)
userRoute.use(cartCount.cartCountMiddelware)
userRoute.use(wishlistCount.wishlistCountMiddelware)


userRoute.set('views','./views/user')
userRoute.use(express.static('public'));

//Home_page
userRoute.get("/",userController.getHome)
//Login
userRoute.get("/login",sessionHandling.authenticationCheck,userController.loginLoad);
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/logout',sessionHandling.checkingUser,userController.userLogout)
//Sign_up & With_OTP
userRoute.get("/register",sessionHandling.authenticationCheck,(req,res)=>{res.render("signUp")});
userRoute.post("/register",userController.insertUser)
userRoute.post("/verifyOTP",userController.verifyOTP);
userRoute.post('/resendOTP',userController.resendOTPVerificationCode);
//Forgot_Password & With_OTP
userRoute.get('/forgotPassword',(req,res)=>{res.render('forgotPassword')})
userRoute.post('/forgotPassword',userController.forgotVerify);
userRoute.post('/forgotOtp',userController.forgotOTPVerification);
userRoute.post('/setPassword',userController.verifyPassword);
//Get_Products
userRoute.get('/getProducts',userController.getProducts);
userRoute.post('/getProducts',userController.getProducts);
//Filter_Products
// userRoute.post('/filter-products',userController.filterProducts)
//Product_Details
userRoute.get('/productDetails',userController.viewProduct);
//User_Profile & Edit_profile
userRoute.get('/profile',sessionHandling.checkingUser ,userProfileController.getProfile);
userRoute.get('/edit-profile',sessionHandling.checkingUser ,userProfileController.getEditProfile);
userRoute.post('/edit-profile' ,userProfileController.postEditProfile);
//Add_Adress & Delete_Addres
userRoute.get('/add-address',sessionHandling.checkingUser,userProfileController.getAddress)
userRoute.post('/add-address',userProfileController.postAddress)
userRoute.get('/delete-address',sessionHandling.checkingUser,userProfileController.deleteAddress);
//User_Change_Password
userRoute.get('/change-password',sessionHandling.checkingUser,userProfileController.getChangePassword)
userRoute.post('/change-password',userProfileController.postChangePassword)
//Wishlist
userRoute.get('/wishlist',sessionHandling.checkingUser,userController.getWishlist);
userRoute.get('/add-wishlist',sessionHandling.checkingUser,userController.addToWishlist)
userRoute.post('/deleteWishlistProduct',userController.deleteWishlist)
//User_Cart
userRoute.get('/user-cart',sessionHandling.checkingUser,cartController.getCart)
userRoute.get('/user-add-to-cart',sessionHandling.checkingUser,cartController.addToCart);
//Update_Cart-Quanity
userRoute.get('/update-quantity',sessionHandling.checkingUser,cartController.changeProductQuantity);
//Delete_cart
userRoute.get('/delete-from-cart',sessionHandling.checkingUser,cartController.deleteFromCart);
//User_Checkout
userRoute.get('/user-checkout',sessionHandling.checkingUser,cartController.getCheckout)
userRoute.get('/landing-page',sessionHandling.checkingUser,cartController.getLanding)
//Place_Order
userRoute.post('/place-order',sessionHandling.checkingUser,cartController.placeOrder);
//User_Orders & Details
userRoute.get('/orders',sessionHandling.checkingUser,userController.getOrders)
userRoute.get('/order-details',sessionHandling.checkingUser,userController.OrderDetails);
//Cancel_Order
userRoute.post("/cancel-order",userController.cancelOrder)
//Return_Order
userRoute.post("/return-order",userController.returnOrder);
// userRoute.get("*",(req,res)=> res.status(404).render('page-404'))




module.exports= userRoute