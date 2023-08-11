const Category = require("../models/Category");
const { deleteOne } = require("../models/Customer");
const Product = require("../models/Products");
const path=require('path')




module.exports={

    viewProducts: async (req,res)=>{
        try {
            const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);
            let search="";
            if(req.query.search){
                search=req.query.search
            }
            const products= await Product.find({
                isActive:true,
                $or: [
    
                    {name:{$regex:'.*'+search+'.*',$options:'i'}},
                    {category:{$regex:'.*'+search+'.*',$options:'i'}},
                    {subCategory:{$regex:'.*'+search+'.*',$options:'i'}}
                ]
            })
            .skip((page - 1) * perPage)
            .limit(perPage);
            res.render('products',{products,admin:true, totalPages, currentPage:page})
        } catch (error) {
            console.log(error.message)
        }
    },

    getEditProducts: async (req,res)=>{
        try {
            const data= await Product.findOne({_id:req.query.id});
            const category= await Category.find()
            res.render('editProducts',{data,category,admin:true})
        } catch (error) {
            console.log(error.message)
        }
    },

    deleteProduct: async (req,res)=>{
        try {
            const productId=req.query.id;
            await Product.updateOne({_id:productId},{$set:{isActive:false}});
            res.redirect('/admin/products')
        } catch (error) {
            console.log(error.message)
        }
    },

    postEditProducts: async (req,res)=>{
        try {
            const {productId}=req.query
            
await Product.updateOne(
    { _id: productId },
    {
      $set: {
        name: req.body.name,
        description: req.body.description,
        color: req.body.color,
        size: req.body.size,
        price: req.body.price,
        totalQty: req.body.totalQty,
        category: req.body.category,
        subCategory: req.body.subCategory,
      }
    }
  );
 
                res.redirect('/admin/products')
        } catch (error) {
            console.log(error.message)
        }
    },

    getAddProduct:async (req,res)=>{
        try {
            const addProductSuccess = req.query.addProductSuccess;
            console.log(addProductSuccess)
            const category= await Category.find({});
            // console.log(category)
            res.render('addProduct',{category,addProductSuccess,admin:true})
        } catch (error) {
            console.log(error.message)
        }
    },

    postAddProduct:async (req,res)=>{
        try {
            const images = req.files.map(file => path.basename(file.path));
            console.log(req.body);
            const softDeleted= await Product.findOne({name:req.body.name,isActive:false,size:req.body.size,color:req.body.color});
            if(softDeleted){
                await Product.updateOne(
                    {_id:softDeleted._id},
                    {$set:{isActive:true}}
                )
            }else{
                const product = new Product({
                    name:req.body.name,
                    description:req.body.description,
                    price:req.body.price,
                    size:req.body.size,
                    color:req.body.color,
                    category:req.body.category,
                    subCategory:req.body.subCategory,
                    totalQty:req.body.totalQty,
                    images:images
                });
                await product.save();
            }

            res.redirect('/admin/add-product?addProductSuccess=Product%20added%20successfully!')
        } catch (error) {
            console.log(error.message)
        }
    }

}

