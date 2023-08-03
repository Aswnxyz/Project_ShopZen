const express=require('express');
const app=express();
const expressLayouts = require('express-ejs-layouts');

const mongoose= require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ShopZen");

const port = process.env.PORT || 3000;

const noCache= require('nocache');
app.use(noCache())

const userRouter=require("./routers/userRoute")
const adminRouter=require("./routers/adminRoute");

const path = require('path');

const session = require('express-session');
const config= require('./config/config')
app.use(session({secret:config.sessionSecret,resave : true, saveUninitialized : true}))

const bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

app.use(expressLayouts);
app.set('layout','../layouts/layout')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));



app.use('/',userRouter)
app.use('/admin',adminRouter)



app.listen(port,()=>{
    console.log("Server started to running ... http://localhost:3000")
})