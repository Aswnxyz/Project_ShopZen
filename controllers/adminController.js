const { ObjectId } = require('mongodb');
const Customer = require('../models/Customer');
const Order = require('../models/Orders');
const Products = require('../models/Products');
const bcrypt = require('bcrypt')


const dashBoard = async (req, res) => {
    try {
        res.render('adminDashboard', { admin: true })
    } catch (error) {
        console.log(error.message)
    }
}


const loginLoad = async (req, res) => {
    try {
        res.render('login', { admin: true })
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await Customer.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                console.log('no problem')
                if (userData.is_admin) {
                    res.render('login', { message: "Invalid Password", admin: true })
                } else {
                    // console.log('what happend')
                    req.session.admin_id = userData._id;
                    // console.log(req.session.admin_id)
                    res.redirect('/admin')
                }
            } else {
                res.render('login', { message: "Invalid Password", admin: true })
            }
        } else {
            res.render('login', { message: "Invalid Email and Password", admin: true })
        }
    } catch (error) {
        console.log(error.message)
    }

}

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null;
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


const userLoad = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search
        }
        const userData = await Customer.find({
            verified: true,
            $or: [

                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]

        })
        res.render('users', { users: userData, admin: true })
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const userId = req.query.id;
        await Customer.updateOne({ _id: userId }, { is_active: false });
        res.redirect('/admin/users')

    } catch (error) {
        console.log(error.message)
    }
}

const unBlockUser = async (req, res) => {
    try {
        const userId = req.query.id;
        await Customer.updateOne({ _id: userId }, { is_active: true });
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error.message)
    }
}

//User_Orders
const getUserOrders = async (req, res) => {
    try {
        const successMessage = req.session.successMessage;
        if (successMessage) {
          // Clear the success message from the session to prevent showing it again on page refresh
          delete req.session.successMessage;
        }
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage);

        let search = "";
        if (req.query.orderId) {
            search = req.query.orderId
        }
        const allOrders = await Order.find({
            $or: [

                { orderId: { $regex: '.*' + search + '.*', $options: 'i' } },
                
            ]

        }).sort({ createdAt: -1 }) // Assuming you want to sort by creation date in descending order
    .skip((page - 1) * perPage)
    .limit(perPage)
    .populate('userId')

    const startingIndex = (page - 1) * perPage + 1;
    console.log(allOrders)

        res.render('ordersList', { admin: true, allOrders,  totalPages, currentPage:page, startingIndex, successMessage  })
    } catch (error) {
        console.log(error.message)
    }
};


//user_order_ details 
const userOrderDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const {status} = req.query
        console.log(status);
        const singleDetails = await Order.aggregate([
            {
                $match: { _id: new ObjectId(id) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item:{$toObjectId:'$products.item'} ,
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }
        ]);

        console.log(singleDetails[0].product)

        const orderDetails= await Order.find({_id:new ObjectId(id)});
        // console.log('order details : ',orderDetails)
        res.render('orderDetails', { admin: true,singleDetails,orderDetails,status })
    } catch (error) {
        console.log(error.message)
    }
}

//change _order_status 
const changeOrderStatus= async (req,res)=>{
    try {
        
      const {orderId,newStatus}=req.body
        await Order.updateOne(
            {_id :new ObjectId(orderId)},
            {$set:{ orderStatus: newStatus}}
        );
        req.session.successMessage = ` Order Status Changed to ${newStatus} `;

        const products= await Order.aggregate([
            {$match:{ orderId: orderId }},
            {$unwind:'$products'},
            {$project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }}
          ]);

        // if(newStatus=== 'cancelled'){
        //     for (let i = 0; i < products.length; i++) {
        //         await Products.updateOne(
        //           { _id: new ObjectId(products[i].item) },
        //           { $inc: { totalQty: products[i].quantity } } // Corrected access to the quantity value
        //         );
        //       }
        // }

        res.json({status:true})
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    loginLoad,
    verifyLogin,
    userLoad,
    blockUser,
    unBlockUser,
    dashBoard,
    adminLogout,
    getUserOrders,
    userOrderDetails,
    changeOrderStatus
}