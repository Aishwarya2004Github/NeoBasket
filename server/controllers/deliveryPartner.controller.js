import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";


// CREATE DELIVERY PARTNER

export async function createDeliveryPartnerController(req,res){

try{


const {
employeeId,
name,
age,
gender,
mobile,
email,
password,
address
}=req.body;



// required fields check

if(
!employeeId ||
!name ||
!mobile ||
!email ||
!password
){

return res.status(400).json({

success:false,

message:"All fields are required"

});

}



// email already exists check

const existing =
await prisma.deliveryPartner.findUnique({

where:{
email
}

});


if(existing){

return res.status(400).json({

success:false,

message:"Email already exists"

});

}



// password hash

const hashPassword =
await bcrypt.hash(password,10);




// create delivery partner

const partner =
await prisma.deliveryPartner.create({

data:{


employeeId,

name,

age:Number(age),

gender,

mobile,

email,

password:hashPassword,

address,


// photo save path

photo:req.file
?
`/uploads/deliverypartner/${req.file.filename}`
:
null


}


});



return res.json({

success:true,

message:"Delivery Partner Added Successfully",

data:partner

});



}catch(error){


console.log(
"DELIVERY PARTNER ERROR:",
error
);



return res.status(500).json({

success:false,

message:error.message

});


}

}


// GET ALL DELIVERY PARTNER


export async function getDeliveryPartnersController(req,res){

try{


const partners =
await prisma.deliveryPartner.findMany({

orderBy:{
createdAt:"desc"
},


include:{

_count:{
select:{
orders:true
}
}

}

});



return res.json({

success:true,

data:partners

});



}catch(error){


return res.status(500).json({

success:false,

message:error.message

});


}
}
export async function deleteDeliveryPartnerController(req,res){

try{

const { id } = req.params;


const partner = await prisma.deliveryPartner.delete({

where:{
id
}

});


return res.json({

success:true,

message:"Delivery Partner Deleted Successfully",

data:partner

});


}catch(error){

console.log(
"DELETE PARTNER ERROR:",
error
);


return res.status(500).json({

success:false,

message:error.message

});


}

}
export async function getDeliveryPartnerDetailsController(req,res){

try{


const {id}=req.params;


const partner = await prisma.deliveryPartner.findUnique({

where:{
id
},


include:{


orders:{


include:{


product:true,

user:true,

delivery_address:true


},


orderBy:{


createdAt:"desc"


}


}


}


});



if(!partner){

return res.status(404).json({

success:false,

message:"Delivery Partner Not Found"

});

}



return res.json({

success:true,

data:partner

});



}catch(error){


return res.status(500).json({

success:false,

message:error.message

});


}


}