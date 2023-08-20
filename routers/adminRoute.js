const express=require ('express');
const adminRoute=express();
// const session=require('express-session');

const adminController=require('../controllers/adminController');
const categoryController=require('../controllers/categoryController');
const productController=require('../controllers/productController');

// adminRoute.set('layout','../layouts')
const sessionHandling=require('../middleware/session-handling')
const isLoggedIn=require('../middleware/isLoggedIn')
const productUpload=require('../middleware/productsMulter')
const bannerUpload=require('../middleware/bannerMulter')



adminRoute.use(isLoggedIn.isAdminLoggedInMiddleware)

// adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin')
adminRoute.use(express.static('public'));
// adminRoute.use('/css',express.static(__dirname + 'public/css'));

//Admin_DashBoard
adminRoute.get("/",sessionHandling.checkingAdmin,adminController.dashBoard);
adminRoute.get('/create-report',sessionHandling.checkingAdmin,adminController.getReport)
//Admin_login & Logout
adminRoute.get("/login",sessionHandling.adminAuthenticationcheck,adminController.loginLoad);
adminRoute.post("/login",adminController.verifyLogin);
adminRoute.get("/logout",sessionHandling.checkingAdmin,adminController.adminLogout);
//Users_List
adminRoute.get("/users",sessionHandling.checkingAdmin,adminController.userLoad);
//Block_User
adminRoute.get("/block-user",sessionHandling.checkingAdmin,adminController.blockUser);
//Unblock_user
adminRoute.get("/unblock-user",sessionHandling.checkingAdmin,adminController.unBlockUser);
//Get_Products
adminRoute.get("/products",sessionHandling.checkingAdmin,productController.viewProducts); 
//Edit_Products
adminRoute.get("/edit-product",sessionHandling.checkingAdmin,productController.getEditProducts);
adminRoute.post("/edit-product",productController.postEditProducts);
//Delete_Products
adminRoute.get("/delete-product",sessionHandling.checkingAdmin,productController.deleteProduct);
//Get_Category
adminRoute.get("/category",sessionHandling.checkingAdmin,categoryController.categoryLoad);
//Add_New_Category && Subcategory
adminRoute.post("/add-category",categoryController.addProductCategory);
adminRoute.post("/add-subcategory",categoryController.addProductSubCategory);
//delete_categories
adminRoute.get("/deleteProductCategory",sessionHandling.checkingAdmin,categoryController.deleteProductCategory);
//Edit_ category
adminRoute.get("/editProductCategory",sessionHandling.checkingAdmin,categoryController.editProdutCategory);
adminRoute.post("/editProdutSubcategory",categoryController.editProdutSubcategory);
adminRoute.get("/deleteProdutSubcategory",sessionHandling.checkingAdmin,categoryController.deleteProdutSubcategory);
//Edit_Category_Name
adminRoute.post("/editCategoryName",categoryController.editCategoryName);
//Add_products
adminRoute.get("/add-product",sessionHandling.checkingAdmin,productController.getAddProduct);
adminRoute.post("/add-product",productUpload,productController.postAddProduct);
//Get_Orders
adminRoute.get("/orders",sessionHandling.checkingAdmin,adminController.getUserOrders);
//Get_Order_Details
adminRoute.get('/user-orderDetails/:id',sessionHandling.checkingAdmin,adminController.userOrderDetails)
//Change_Status
adminRoute.post('/change-status',adminController.changeOrderStatus)
//Date_Wise_Report
adminRoute.post('/date-wise-report',adminController.dateWiseReport)
//Coupon
adminRoute.get('/coupons',sessionHandling.checkingAdmin,adminController.getCoupon)
//Add-Coupon
adminRoute.post('/coupons',adminController.postCoupon)
//Delte_Coupon
adminRoute.post('/delete-coupon',adminController.deleteCoupon)
//Block_Coupon
adminRoute.get('/block-coupon',sessionHandling.checkingAdmin ,adminController.blockCoupon)
//Banner 
adminRoute.get('/banners',sessionHandling.checkingAdmin,adminController.getBanners)
//Add_ banner
adminRoute.get('/add-banner',sessionHandling.checkingAdmin,adminController.getAddBanner)
adminRoute.post('/add-banner',bannerUpload,adminController.postAddBanner)  
//Deletet_Banner
adminRoute.post('/delete-banner',adminController.deleteBanner)
//Find_Subcategories_For_Add_Product
adminRoute.post('/findSubCategories',categoryController.findSubCategories)



module.exports=adminRoute