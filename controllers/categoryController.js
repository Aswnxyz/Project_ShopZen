const Category = require("../models/Category");
const { findOne } = require("../models/Customer");

module.exports={
 
    categoryLoad: async (req,res)=>{
        try {
            const successMessage = req.session.successMessage;
            if (successMessage) {
              // Clear the success message from the session to prevent showing it again on page refresh
              delete req.session.successMessage;
            }
            const {message,subMessage} = req.query
            let search="";
            if(req.query.search){
                search=req.query.search
            }
            const category= await Category.find({
                $or: [
    
                    {name:{$regex:'.*'+search+'.*',$options:'i'}},
                    {subCategory:{$regex:'.*'+search+'.*',$options:'i'}}
                ]
            });
            res.render('category',{successMessage,category,admin:true,message,subMessage})
        } catch (error) {
            console.log(error.message)
        }
    },

    addProductCategory: async (req,res)=>{
        try {
            const {categoryName} = req.body;
            // console.log(req.body)
            const existingCategory= await Category.find({name:categoryName});
            // console.log(existingCategory)
            if(existingCategory.length){
                // res.json({res:false})
                res.redirect('/admin/category?message=Category already exists!');
            }else{
                
                const newCategory = new Category({
                    name:categoryName
                });
                await newCategory.save();
                req.session.successMessage = 'New Category added successfully!'; 
                res.redirect('/admin/category');
                // res.json({res:true})
            }
            
            
            
        } catch (error) {
            console.log(error.message)
        }
    },

    addProductSubCategory: async (req,res)=>{
        try {
            const {subcategoryName}=req.body;
            const {categoryName}=req.query;
            const existingCategory=await Category.findOne({name:categoryName});
            if(existingCategory.subCategory.includes(subcategoryName)){
                res.redirect('/admin/category?subMessage=subCategory already exists!')
            }else{
                existingCategory.subCategory.push(subcategoryName);
                existingCategory.save();
                req.session.successMessage = 'New Subategory added successfully!';
                res.redirect('/admin/category')
   
            }
           
        } catch (error) {
            console.log(error.message)
        }
    },

    deleteProductCategory: async (req,res)=>{
        try {
            const {categoryName}=req.query;
            await Category.deleteOne({name:categoryName});
            res.redirect('/admin/category')

        } catch (error) {
            console.log(error.message)
        }
    },

    editProdutCategory: async (req,res)=>{
        try {
            const successMessage = req.session.successMessage;
            if (successMessage) {
              // Clear the success message from the session to prevent showing it again on page refresh
              delete req.session.successMessage;
            }
            const {categoryName} = req.query;
            console.log('product catgoryyyyyyy: ', req.query)
            console.log(categoryName)
            const category= await Category.findOne({name:categoryName});
            console.log(category)
            res.render('editCategory',{successMessage,category,admin:true})
        } catch (error) {
            console.log(error.message)
        }
    },

    editProdutSubcategory : async (req,res)=>{
        try {
            const {categoryName}= req.query;
            const subcategoryName=req.query.subcategoryName
            console.log(subcategoryName)
            const {updatedSubcategoryName}=req.body;
            console.log(req.body)
            await Category.updateOne(
                { "subCategory": subcategoryName },
                { $set: { "subCategory.$": updatedSubcategoryName }}
              );
              req.session.successMessage = ` Subcategory Name changed to ${updatedSubcategoryName} !`; 

            res.redirect(`/admin/editProductCategory?categoryName=${categoryName}`)
        } catch (error) {
               console.log(error.message)
        }
    },

    deleteProdutSubcategory: async (req,res)=>{
        try {
            const {categoryName}= req.query;
            const subcategoryName=req.query.subcategoryName
            await Category.updateOne(
                {"subCategory": subcategoryName },
                {$pull:{subCategory:subcategoryName}}
                );
                res.redirect(`/admin/editProductCategory?categoryName=${categoryName}`)
        } catch (error) {
            console.log(error.message)
        }
    },

    editCategoryName: async (req,res)=>{
        try {
            console.log('starting point : ' , req.query)
            const {categoryName}=req.query;
            const {updatedCategoryName}=req.body;
            await Category.updateOne(
                {name:categoryName},
                {$set:{name:updatedCategoryName}}
            );
            if(categoryName !== updatedCategoryName){
                req.session.successMessage = ` Category Name changed to ${updatedCategoryName} !`; 
            }
            res.redirect(`/admin/editProductCategory?categoryName=${updatedCategoryName}`)

        } catch (error) {
            console.log(error.message)
        }
    }

}