

const isAdminLoggedInMiddleware= (req,res,next)=>{
    if(req.session.admin_id){
        res.locals.isLoggedIn=true
    }else{
        res.locals.isLoggedIn=false
    }

    next()
}

const isLoggedInMiddleware=(req,res,next)=>{
    if(req.session.user_id){
        res.locals.isLoggedIn=true
    }else{
        res.locals.isLoggedIn=false
    }

    next()
}

module.exports={
    isAdminLoggedInMiddleware,
    isLoggedInMiddleware
}