
const multer= require('multer');
const path=require('path')




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../public/productImages'));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const upload = multer({ storage: storage }).array('images',10)
  

module.exports=upload




// const storage =multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,path.join(__dirname,'../public/productImages'))
//     },
//     filename:(req,file,cb)=>{
//         cb(null,path.extname(file.originalname))
//     }
// });

// const upload= multer({storage:storage}).array('images',10)