import {Router} from "express";

import upload from "../middleware/multer.js";

import {
createDeliveryPartnerController,
getDeliveryPartnersController,
deleteDeliveryPartnerController,
getDeliveryPartnerDetailsController

} from "../controllers/deliveryPartner.controller.js";


import {
auth,
admin

} from "../middleware/auth.js";



const router=Router();



// CREATE

router.post(

"/create",

auth,

admin,

upload.single("photo"),

createDeliveryPartnerController

);



// LIST

router.get(

"/list",

auth,

admin,

getDeliveryPartnersController

);

router.delete(

"/delete/:id",

auth,

admin,

deleteDeliveryPartnerController

);
router.get(

"/details/:id",

auth,

admin,

getDeliveryPartnerDetailsController

);


export default router;