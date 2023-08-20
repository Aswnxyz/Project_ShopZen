const { ObjectId } = require("mongodb");
const Customer = require("../models/Customer");
const Order = require("../models/Orders");
const Products = require("../models/Products");
const bcrypt = require("bcrypt");
const { captureRejectionSymbol } = require("nodemailer/lib/xoauth2");
const Category = require("../models/Category");
const Coupon = require("../models/Coupons");
const Banner = require("../models/Banners");
const path = require("path");
const StreamTransport = require("nodemailer/lib/stream-transport");

// const { default: products } = require('razorpay/dist/types/products');

const dashBoard = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: "recieved",
        },
      },
      {
        $project: {
          totalPrice: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          totalSales: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);
    console.log(monthlySales);
    const users = await Customer.countDocuments();
    console.log(users);
    const totalOrders = await Order.aggregate([
      { $match: { orderStatus: "recieved" } },
      { $count: "totalOrders" },
    ]);
    console.log(totalOrders);
    const orders = totalOrders[0] ? totalOrders[0].totalOrders : 0;
    console.log(orders);
    const productsData = await Products.aggregate([
      {
        $group: {
          _id: "$name",
          firstProduct: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$firstProduct" },
      },
    ]);
    const products = productsData.length;

    console.log(`Total products: ${products}`);
    const totalSales = monthlySales[0]
      ? monthlySales[monthlySales.length - 1].totalSales
      : 0;
    console.log("total sales :::", totalSales);
    // getting details sales graph
    const pipeline = [
      {
        $match: {
          orderStatus: "recieved",
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: "$count",
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ];
    // Execute the aggregation pipeline
    const results = await Order.aggregate(pipeline);
    // Create an array of 12 months with 0 orders
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
    }));
    // Merge the results with the months array
    const monthlyOrders = months.map((m) => {
      const monthResult = results.find((r) => r.month === m.month);
      return monthResult ? monthResult : m;
    });
    const monthlyOrdersArray = monthlyOrders.map((obj) => obj.count);
    // getting details for pie chart
    const result = await Products.aggregate([
      {
        $group: {
          _id: "$name",
          firstProduct: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$firstProduct" },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    console.log("RESULT", result);
    const categoryWise = {};
    result.forEach((item) => {
      categoryWise[item._id] = item.count;
    });
    console.log(categoryWise);
    const cateWise = Object.values(categoryWise);
    console.log(cateWise);

//Trending_Product_Of_The_Month
    const currentDate = new Date();

// Calculate the start of the current month
const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
console.log(startOfMonth)

    const trendingProducts= await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $unwind: "$products"
      },
      {
        $group: {
          _id: "$products.item",
          totalQuantity: { $sum: "$products.quantity" },
          productName: { $first: "$products.name" },
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);
    console.log('Trending Product::',trendingProducts)
    const trendingProductIds = trendingProducts.map(product => product._id);
    const categories = await Products.aggregate([
      {
        $match: {
          _id: { $in: trendingProductIds }
        }
      },
      {
        $group: {
          _id: "$category",
          totalQuantity: { $sum: "$totalQty" }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);
    
    const mostOrderedCategory = categories[0]; // The category with the highest total quantity
    
    console.log('Most Ordered Category:', mostOrderedCategory);

    res.render("adminDashboard", {
      admin: true,
      totalSales,
      users,
      orders,
      products,
      monthlyOrdersArray,
      cateWise,
      trendingProducts,
      mostOrderedCategory
    });
  } catch (error) {
    console.log(error.message);
  }
};

//Get_Report_page
const getReport = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: "recieved",
        },
      },
      {
        $project: {
          totalPrice: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          totalSales: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);
    console.log(monthlySales);
    const users = await Customer.countDocuments();
    console.log(users);
    const totalOrders = await Order.aggregate([
      { $match: { orderStatus: "recieved" } },
      { $count: "totalOrders" },
    ]);
    console.log(totalOrders);
    const orders = totalOrders[0] ? totalOrders[0].totalOrders : 0;
    console.log(orders);
    const products = await Products.countDocuments();

    console.log(`Total products: ${products}`);
    const totalSales = monthlySales[0] ? monthlySales[0].totalSales : 0;

    res.render("sales-report", {
      admin: true,
      totalSales,
      users,
      orders,
      products,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//date_Wise_report
const dateWiseReport = async (req, res) => {
  try {
    console.log("Bodyy:::", req.body);
    // const fromDate = new Date(req.body.fromDate);
    // const toDate = new Date(req.body.toDate);
    // toDate.setDate(toDate.getDate() + 1);

    let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : new Date();
    let toDate = req.body.toDate ? new Date(req.body.toDate) : new Date();
    if (req.body.toDate) {
      toDate.setDate(toDate.getDate() + 1);
    }
    let reportType;
    if (!req.body.fromDate && !req.body.toDate) {
      reportType = req.body.timePeriod;

      console.log(reportType)

      if (reportType === "daily") {
        // For daily, use the current day
        fromDate.setHours(0, 0, 0, 0);
      } else if (reportType === "weekly") {
        // For weekly, use the current week (Sunday to Saturday)
        const today = toDate.getDay();
        fromDate = new Date(toDate);
        fromDate.setDate(toDate.getDate() - today);
        fromDate.setHours(0, 0, 0, 0);
      } else if (reportType === "monthly") {
        // For monthly, use the current month
        fromDate.setDate(1);
        fromDate.setHours(0, 0, 0, 0);
      } else if (reportType === "yearly") {
        // For yearly, use the current year
        fromDate.setMonth(0, 1);
        fromDate.setHours(0, 0, 0, 0);
      }

      toDate.setHours(23, 59, 59, 999);
    } else {
      reportType = req.body.fromDate + " to " + req.body.toDate;
    }

    // --------------------------------------------------------

    // const fromDate = new Date(req.body.fromDate)
    // let toDate = new Date(req.body.toDate);

    // Adjust date range based on the selected time period
    // if (req.body.timePeriod === "daily") {
    //   toDate = new Date(fromDate);
    //   toDate.setDate(toDate.getDate() + 1);
    // } else if (req.body.timePeriod === "weekly") {
    //   toDate.setDate(toDate.getDate() + 7);
    // } else if (req.body.timePeriod === "monthly") {
    //   toDate.setMonth(toDate.getMonth() + 1);
    // } else if (req.body.timePeriod === "yearly") {
    //   toDate.setFullYear(toDate.getFullYear() + 1);
    // }
    // console.log("ToDate :: ", toDate);

    const report = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: fromDate,
            $lt: toDate,
          },
          orderStatus: "recieved",
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const dateWise = JSON.parse(JSON.stringify(report));
    console.log("Datewise ;", dateWise);
    const totalRevenueSum = dateWise.reduce(
      (acc, entry) => acc + entry.totalRevenue,
      0
    );
    const totalOrdersSum = dateWise.reduce(
      (acc, entry) => acc + entry.totalOrders,
      0
    );
    console.log("totalRevenue ::", totalRevenueSum);
    console.log("totalOrders ::", totalOrdersSum);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: "recieved",
        },
      },
      {
        $project: {
          totalPrice: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          totalSales: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);
    console.log("monthly:", monthlySales);
    const users = await Customer.countDocuments();
    console.log(users);
    const totalOrders = await Order.aggregate([
      { $match: { orderStatus: "recieved" } },
      { $count: "totalOrders" },
    ]);
    console.log(totalOrders);
    const orders = totalOrders[0] ? totalOrders[0].totalOrders : 0;
    console.log(orders);
    const products = await Products.countDocuments();

    console.log(`Total products: ${products}`);
    const totalSales = monthlySales[0] ? monthlySales[0].totalSales : 0;

    res.locals.formatCurrency = (amount, locale, currency) => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
      }).format(amount);
    };

    res.render("sales-report", {
      admin: true,
      dateWise,
      totalSales,
      users,
      orders,
      products,
      reportType,
      totalRevenueSum,
      totalOrdersSum,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loginLoad = async (req, res) => {
  try {
    res.render("login", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await Customer.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        console.log("no problem");
        if (userData.is_admin) {
          res.render("login", { message: "Invalid Password", admin: true });
        } else {
          // console.log('what happend')
          req.session.admin_id = userData._id;
          // console.log(req.session.admin_id)
          res.redirect("/admin");
        }
      } else {
        res.render("login", { message: "Invalid Password", admin: true });
      }
    } else {
      res.render("login", {
        message: "Invalid Email and Password",
        admin: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const userLoad = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await Customer.find({
      verified: true,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
        { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    });
    res.render("users", { users: userData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    await Customer.updateOne({ _id: userId }, { is_active: false });
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

const unBlockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    await Customer.updateOne({ _id: userId }, { is_active: true });
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

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
    const totalOrders = await Order.find({
      paymentStatus: { $ne: "processing" },
    }).count();
    const totalPages = Math.ceil(totalOrders / perPage);

    let search = "";
    if (req.query.orderId) {
      search = req.query.orderId;
    }
    const allOrders = await Order.find({
      paymentStatus: { $ne: "processing" },
      $or: [{ orderId: { $regex: ".*" + search + ".*", $options: "i" } }],
    })
      .sort({ createdAt: -1 }) // Assuming you want to sort by creation date in descending order
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("userId");

    const startingIndex = (page - 1) * perPage + 1;
    console.log(allOrders);

    res.render("ordersList", {
      admin: true,
      allOrders,
      totalPages,
      currentPage: page,
      startingIndex,
      successMessage,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//user_order_ details
const userOrderDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.query;
    console.log(status);
    const singleDetails = await Order.aggregate([
      {
        $match: { _id: new ObjectId(id) },
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

    console.log(singleDetails[0].product);

    const orderDetails = await Order.find({ _id: new ObjectId(id) });
    // console.log('order details : ',orderDetails)
    res.render("orderDetails", {
      admin: true,
      singleDetails,
      orderDetails,
      status,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//change _order_status
const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    const orderData = await Order.findOne({ _id: new ObjectId(orderId) });
    if (orderData.paymentStatus === "pending") {
      await Order.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { orderStatus: newStatus, paymentStatus: "completed" } }
      );
    } else {
      await Order.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { orderStatus: newStatus } }
      );
    }

    req.session.successMessage = ` Order Status Changed to ${newStatus} `;

    const products = await Order.aggregate([
      { $match: { orderId: orderId } },
      { $unwind: "$products" },
      {
        $project: {
          item: "$products.item",
          quantity: "$products.quantity",
        },
      },
    ]);

    // if(newStatus=== 'cancelled'){
    //     for (let i = 0; i < products.length; i++) {
    //         await Products.updateOne(
    //           { _id: new ObjectId(products[i].item) },
    //           { $inc: { totalQty: products[i].quantity } } // Corrected access to the quantity value
    //         );
    //       }
    // }

    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

//Get_Coupon
const getCoupon = async (req, res) => {
  try {
    const data = await Coupon.find().lean();
    const coupons = data.reverse();
    res.render("coupons", { admin: true, coupons });
  } catch (error) {
    console.log(error.message);
  }
};

const postCoupon = async (req, res) => {
  try {
    console.log(req.body);
    const data = await Coupon.findOne({ code: req.body.code, isActive: false });

    if (data) {
      data.isActive = true;
      await data.save();
    } else {
      const expirationDate = new Date(req.body.expirationDate);
      expirationDate.setHours(23, 59, 59, 999);
      const newCoupon = new Coupon({
        code: req.body.code,
        discountPercentage: req.body.discountPercentage,
        maxDiscount: req.body.maxDiscountAmount,
        minAmount: req.body.minAmount,
        description: req.body.description,
        expirationDate: expirationDate,
      });
      newCoupon.save();
    }

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    await Coupon.deleteOne({ _id: couponId });
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const blockCoupon = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(req.query);
    const couponData = await Coupon.findById(id);
    if (couponData.isActive) {
      couponData.isActive = false;
    } else {
      couponData.isActive = true;
    }
    await couponData.save();
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error.message);
  }
};

//Banners
const getBanners = async (req, res) => {
  try {
    const data = await Banner.find();
    res.render("banners", { admin: true, data });
  } catch (error) {
    console.log(error.message);
  }
};

const getAddBanner = async (req, res) => {
  try {
    res.render("add-banner", { admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const postAddBanner = async (req, res) => {
  try {
    console.log(req.body);
    const image = path.basename(req.file.path);
    console.log(req.body);
    const { title, startDate, endDate } = req.body;
    const newBanner = new Banner({
      title: title,
      image: image,
      startDate: setHoursToDate(startDate, 0, 0, 0), // Set hours to 00:00:00
      endDate: setHoursToDate(endDate, 23, 59, 59), // Set hours to 23:59:59
    });
    await newBanner.save();
    
    function setHoursToDate(date, hours, minutes, seconds) {
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      newDate.setSeconds(seconds);
      return newDate;
    }

    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.body;
    console.log(bannerId);
    await Banner.deleteOne({ _id: bannerId });
    res.json({ status: true });
  } catch (error) {
    console.log(error.message);
  }
};

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
  changeOrderStatus,
  getReport,
  dateWiseReport,
  getCoupon,
  postCoupon,
  deleteCoupon,
  blockCoupon,
  getBanners,
  getAddBanner,
  postAddBanner,
  deleteBanner,
};
