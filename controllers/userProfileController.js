const Address =require('../models/Address')
const Customer =require('../models/Customer');
const bcrypt= require('bcrypt')


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
        const {userId}=req.query;
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
}


}