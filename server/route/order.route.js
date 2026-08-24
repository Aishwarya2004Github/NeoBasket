import { Router } from "express";

import { 
auth, 
admin 
} from "../middleware/auth.js";


import {

CashOnDeliveryOrderController,
paymentController,
webhookStripe,
getOrderDetailsController,
cancelOrderController,
getAllOrdersController,
updateOrderStatusController,
trackOrderController,
assignDeliveryPartnerController,
getDeliveryOrdersController,
getDeliveryPartnersController,
adminCancelOrderController

} from "../controllers/order.controller.js";



const orderRouter = Router();



console.log("ORDER ROUTER LOADED");




// ================= TEST ROUTE =================


orderRouter.put(
"/cancel-order-test",
(req,res)=>{


console.log(
"TEST CANCEL ROUTE HIT"
);


res.json({

success:true,

message:"route working"

});


});






// ================= CREATE ORDER =================



orderRouter.post(

"/cash-on-delivery",

auth,

CashOnDeliveryOrderController

);





// ================= STRIPE CHECKOUT =================



orderRouter.post(

"/checkout",

auth,

paymentController

);





// ================= STRIPE WEBHOOK =================



orderRouter.post(

"/webhook",

webhookStripe

);







// ================= USER ORDER LIST =================



orderRouter.get(

"/order-list",

auth,

getOrderDetailsController

);







// ================= CANCEL ORDER =================



orderRouter.put(

"/cancel-order",

auth,

cancelOrderController

);







// ================= ADMIN ALL ORDERS =================



orderRouter.get(

"/admin-order-list",

auth,

admin,

getAllOrdersController

);







// ================= TRACK ORDER =================



orderRouter.post(

"/track-order",

auth,

trackOrderController

);








// ================= UPDATE ORDER STATUS ADMIN =================



orderRouter.put(

"/update-status",

auth,

admin,

updateOrderStatusController

);








// ================= ASSIGN DELIVERY PARTNER =================



orderRouter.put(

"/assign-delivery",

auth,

admin,

assignDeliveryPartnerController

);








// ================= DELIVERY PARTNER ORDERS =================



orderRouter.get(

"/delivery-orders",

auth,

getDeliveryOrdersController

);







// ================= DELIVERY PARTNER LIST =================



orderRouter.get(

"/delivery-partners",

auth,

admin,

getDeliveryPartnersController

);

orderRouter.put(

"/admin-cancel-order",

auth,

admin,

adminCancelOrderController

);





export default orderRouter;