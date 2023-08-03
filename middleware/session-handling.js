
module.exports={
    checkingUser:(req,res,next)=>{
        if(req.session.user_id){
            console.log('hshgcfc')
            next()
        }else{

            if (req.xhr) {
                // If it's an AJAX request, send a 401 Unauthorized response with JSON data
                res.status(401).json({ redirectUrl: '/login' });
              } else {
                // If it's a normal request, perform a redirect to the login page
                res.redirect('/login');
              }
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