import multer from "multer";
import path from "path";
import fs from "fs";


const storage = multer.diskStorage({


destination:(req,file,cb)=>{


const uploadPath = "uploads/deliverypartner";


// folder create karega agar nahi hai
if(!fs.existsSync(uploadPath)){

fs.mkdirSync(uploadPath,{
recursive:true
});

}


cb(null,uploadPath);


},



filename:(req,file,cb)=>{


const ext = path.extname(file.originalname);


cb(
null,
Date.now()+ext
);


}


});



const upload = multer({

storage:storage

});


export default upload;