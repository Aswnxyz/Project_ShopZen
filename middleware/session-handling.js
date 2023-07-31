
module.exports={
    checkingUser:(req,res,next)=>{
        if(req.session.user_id){
            next()
        }else{
            res.redirect('/login')
        }
    },

    authenticationCheck:(req,res,next)=>{
        if(req.session.user_id){
            res.redirect("/")
        }else{
            next()
        }
    },

    checkingAdmin:(req,res,next)=>{
        if(req.session.admin_id){
            next()
        }else{
            res.redirect('/admin/login')
        }
    },

    adminAuthenticationcheck: (req,res,next)=>{
        if(req.session.admin_id){
            res.redirect("/admin")
        }else{
            next()
        }
    }
}