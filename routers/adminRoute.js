const express=require ('express');
const adminRoute=express();
// const session=require('express-session');

const adminController=require('../controllers/adminController');
const categoryController=require('../controllers/categoryController');
const productController=require('../controllers/productController');

// adminRoute.set('layout','../layouts')
const sessionHandling=require('../middleware/session-handling')
const isLoggedIn=require('../middleware/isLoggedIn')
const upload=require('../middleware/multer')



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
adminRoute.get("/unblock-user",sessionHandling.checkingAdmin,adminController.unBlockUser);
adminRoute.get("/products",sessionHandling.checkingAdmin,productController.viewProducts);
adminRoute.get("/edit-product",sessionHandling.checkingAdmin,productController.getEditProducts);
adminRoute.post("/edit-product",productController.postEditProducts);
adminRoute.get("/delete-product",sessionHandling.checkingAdmin,productController.deleteProduct);
adminRoute.get("/category",sessionHandling.checkingAdmin,categoryController.categoryLoad);
adminRoute.post("/add-category",categoryController.addProductCategory);
adminRoute.post("/add-subcategory",categoryController.addProductSubCategory);
adminRoute.get("/deleteProductCategory",sessionHandling.checkingAdmin,categoryController.deleteProductCategory);
adminRoute.get("/editProductCategory",sessionHandling.checkingAdmin,categoryController.editProdutCategory);
adminRoute.post("/editProdutSubcategory",categoryController.editProdutSubcategory);
adminRoute.get("/deleteProdutSubcategory",sessionHandling.checkingAdmin,categoryController.deleteProdutSubcategory);
adminRoute.post("/editCategoryName",categoryController.editCategoryName);
adminRoute.get("/add-product",sessionHandling.checkingAdmin,productController.getAddProduct);
adminRoute.post("/add-product",upload,productController.postAddProduct);
adminRoute.get("/orders",sessionHandling.checkingAdmin,upload,adminController.getUserOrders);
adminRoute.get('/user-orderDetails/:id',sessionHandling.checkingAdmin,adminController.userOrderDetails)
adminRoute.post('/change-status',sessionHandling.checkingAdmin,adminController.changeOrderStatus)
//Date_Wise_Report
adminRoute.post('/date-wise-report',adminController.dateWiseReport)



module.exports=adminRoute