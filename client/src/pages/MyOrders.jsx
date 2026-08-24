import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import NoData from "../components/NoData";

const MyOrders = () => {
  const user = useSelector((state) => state.user);

  const [orders, setOrders] = useState([]);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // STATUS POPUP STATES
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);

  const getOrders = async () => {
    try {
      const api =
        user?.role === "ADMIN"
          ? "http://localhost:8080/api/order/admin-order-list"
          : "http://localhost:8080/api/order/order-list";

      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getOrders();
    }
  }, [user?._id]);

  // STATUS UPDATE AFTER CONFIRM
  const updateStatus = async () => {
    try {
      const response = await axios.put(
        "http://localhost:8080/api/order/update-status",
        {
          orderId: selectedStatusOrder.orderId,
          status: selectedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Order Status Updated");
        setShowStatusPopup(false);
        setSelectedStatus("");
        setSelectedStatusOrder(null);
        getOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  // USER + ADMIN CANCEL ORDER
  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    if (cancelReason.trim() === "") {
      toast.error("Please enter cancellation reason");
      return;
    }

    try {
      const api =
        user?.role === "ADMIN"
          ? "http://localhost:8080/api/order/admin-cancel-order"
          : "http://localhost:8080/api/order/cancel-order";

      const response = await axios.put(
        api,
        {
          orderId: selectedOrder.orderId,
          reason: cancelReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Order Cancelled");
        setShowCancelPopup(false);
        setCancelReason("");
        setSelectedOrder(null);
        getOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel Failed");
    }
  };

  // Helper for Status Badge Color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {user?.role === "ADMIN" ? "All Customer Orders" : "My Orders"}
          </h1>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Total: {orders.length}
          </span>
        </div>

        {/* Orders List / Empty State */}
        {orders.length === 0 ? (
          <NoData />
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order._id || index}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 overflow-hidden"
              >
                {/* Order ID & Status Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400 block tracking-wider">
                      Order Reference
                    </span>
                    <h2 className="text-base font-bold text-slate-800 font-mono">
                      #{order.orderId}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg border ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Admin Customer Info Card */}
                {user?.role === "ADMIN" && (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <p className="text-slate-600">
                      Customer:{" "}
                      <b className="text-slate-900 font-semibold">
                        {order.user?.name || "N/A"}
                      </b>
                    </p>
                    <p className="text-slate-600">
                      Mobile:{" "}
                      <b className="text-slate-900 font-semibold">
                        {order.user?.mobile || "N/A"}
                      </b>
                    </p>
                    <p className="text-slate-600 truncate">
                      Email:{" "}
                      <b className="text-slate-900 font-semibold">
                        {order.user?.email || "N/A"}
                      </b>
                    </p>
                  </div>
                )}

                {/* Order Product Details */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img
                    src={
                      order.product_image?.[0]
                        ? order.product_image[0].startsWith("http")
                          ? order.product_image[0]
                          : `http://localhost:8080${order.product_image[0]}`
                        : "/no-image.png"
                    }
                    alt={order.product_name}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 space-y-1.5 text-sm text-slate-600">
                    <h3 className="font-bold text-slate-900 text-base">
                      {order.product_name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-medium pt-1">
                      <p className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                        Qty: {order.quantity || 1}
                      </p>
                      <p className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100 font-bold">
                        Total: ₹{order.totalAmt}
                      </p>
                      <p className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 font-semibold">
                        Payment: {order.payment_status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Actions Bar */}
                {user?.role === "ADMIN" && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setSelectedStatusOrder(order);
                          setSelectedStatus("ACCEPTED");
                          setShowStatusPopup(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        Accept Order
                      </button>
                    )}

                    {["ACCEPTED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(
                      order.status
                    ) && (
                      <select
                        value={order.status}
                        onChange={(e) => {
                          setSelectedStatusOrder(order);
                          setSelectedStatus(e.target.value);
                          setShowStatusPopup(true);
                        }}
                        className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-slate-400 transition-all cursor-pointer"
                      >
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    )}

                    {order.status !== "DELIVERED" &&
                      order.status !== "CANCELLED" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelPopup(true);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                )}

                {/* User Cancel Action */}
                {user?.role !== "ADMIN" &&
                  order.status !== "DELIVERED" &&
                  order.status !== "CANCELLED" && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelPopup(true);
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                {/* Cancelled Info Card */}
                {order.status === "CANCELLED" && (
                  <div className="mt-4 bg-rose-50/70 border border-rose-200 p-4 rounded-xl text-xs sm:text-sm text-rose-900 space-y-1">
                    <h3 className="font-bold text-rose-700 text-sm mb-1">
                      Order Cancelled
                    </h3>
                    <p>
                      <span className="font-medium text-rose-600">Cancelled By:</span>{" "}
                      <b>{order.cancelledBy || "N/A"}</b>
                    </p>
                    <p>
                      <span className="font-medium text-rose-600">Reason:</span>{" "}
                      <span>{order.cancelReason || "No reason provided"}</span>
                    </p>
                    {order.cancelledAt && (
                      <p>
                        <span className="font-medium text-rose-600">Time:</span>{" "}
                        <span>{new Date(order.cancelledAt).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Status Modal */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Update Order Status
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Are you sure you want to transition this order to:
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center mb-6">
              <span className="text-lg font-black text-amber-600 font-mono tracking-wide">
                {selectedStatus}
              </span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusPopup(false);
                  setSelectedStatus("");
                  setSelectedStatusOrder(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={updateStatus}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Cancel Order
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Please state a valid reason for cancelling this order.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-slate-400 outline-none resize-none transition-all"
              placeholder="E.g., Customer requested cancellation..."
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowCancelPopup(false);
                  setCancelReason("");
                  setSelectedOrder(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancelOrder}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
/*import React,{useEffect,useState} from "react";
import {useSelector} from "react-redux";
import axios from "axios";
import {toast} from "react-hot-toast";
import NoData from "../components/NoData";
import "./MyOrders.css";

const MyOrders =()=>{


const user = useSelector(
(state)=>state.user
);



const [orders,setOrders]=useState([]);


const [showCancelPopup,setShowCancelPopup]=useState(false);

const [selectedOrder,setSelectedOrder]=useState(null);

const [cancelReason,setCancelReason]=useState("");



// STATUS POPUP

const [showStatusPopup,setShowStatusPopup]=useState(false);

const [selectedStatus,setSelectedStatus]=useState("");

const [selectedStatusOrder,setSelectedStatusOrder]=useState(null);





const getOrders=async()=>{


try{


const api =

user?.role==="ADMIN"

?

"http://localhost:8080/api/order/admin-order-list"

:

"http://localhost:8080/api/order/order-list";




const response = await axios.get(

api,

{

headers:{

Authorization:

`Bearer ${localStorage.getItem("accesstoken")}`

}

}

);




if(response.data.success){

setOrders(response.data.data);

}



}
catch(error){


console.log(

error.response?.data ||

error.message

);


}


};






useEffect(()=>{


if(user?._id){

getOrders();

}


},[user?._id]);





// STATUS UPDATE AFTER CONFIRM


const updateStatus=async()=>{


try{


const response = await axios.put(


"http://localhost:8080/api/order/update-status",


{

orderId:selectedStatusOrder.orderId,

status:selectedStatus

},


{

headers:{

Authorization:

`Bearer ${localStorage.getItem("accesstoken")}`

}

}

);



if(response.data.success){


toast.success(
"Order Status Updated"
);


setShowStatusPopup(false);

setSelectedStatus("");

setSelectedStatusOrder(null);


getOrders();


}



}
catch(error){


toast.error(

error.response?.data?.message ||

"Status update failed"

);


}


};

// USER + ADMIN CANCEL ORDER


const confirmCancelOrder=async()=>{


if(!selectedOrder)
return;



if(cancelReason.trim()===""){


toast.error(
"Please enter cancellation reason"
);


return;


}




try{


const api =

user?.role==="ADMIN"

?

"http://localhost:8080/api/order/admin-cancel-order"

:

"http://localhost:8080/api/order/cancel-order";





const response = await axios.put(


api,


{

orderId:selectedOrder.orderId,

reason:cancelReason

},


{

headers:{

Authorization:

`Bearer ${localStorage.getItem("accesstoken")}`

}

}

);





if(response.data.success){


toast.success(
"Order Cancelled"
);



setShowCancelPopup(false);

setCancelReason("");

setSelectedOrder(null);


getOrders();


}



}
catch(error){


toast.error(

error.response?.data?.message ||

"Cancel Failed"

);


}


};








return(


<>


<div className="container mx-auto p-5">



<div className="bg-white shadow rounded p-4 mb-5">


<h1 className="text-2xl font-bold">


{

user?.role==="ADMIN"

?

"All Customer Orders"

:

"My Orders"

}


</h1>


</div>





{

orders.length===0

?


<NoData/>


:


orders.map((order,index)=>(



<div

key={order._id || index}

className="bg-white shadow rounded-lg p-5 mb-5"

>





<h2 className="font-bold">

Order ID :

{order.orderId}

</h2>






{

user?.role==="ADMIN"

&&


<div className="bg-gray-100 p-3 mt-3 rounded">


<p>

Customer :

<b>

{order.user?.name}

</b>


</p>



<p>

Mobile :

{order.user?.mobile}

</p>




<p>

Email :

{order.user?.email}

</p>


</div>


}






<div className="flex gap-5 mt-4">



<img


src={


order.product_image?.[0]


?


(

order.product_image[0].startsWith("http")


?


order.product_image[0]


:


`http://localhost:8080${order.product_image[0]}`


)


:


"/no-image.png"


}


className="w-24 h-24 object-cover rounded"

/>





<div>


<h3 className="font-bold">

{order.product_name}

</h3>



<p>

Quantity :

{order.quantity || 1}

</p>



<p>

Amount :

₹{order.totalAmt}

</p>




<p>

Payment :

{order.payment_status}

</p>




<p>

Status :

<span className="font-bold ml-2">

{order.status}

</span>


</p>



</div>



</div>



{

user?.role==="ADMIN"

&&


<div className="mt-5 flex gap-3 flex-wrap">





{/* ACCEPT ORDER }
/*


{

order.status==="PENDING"

&&


<button


onClick={()=>{


setSelectedStatusOrder(order);

setSelectedStatus("ACCEPTED");

setShowStatusPopup(true);


}}


className="bg-green-600 text-white px-4 py-2 rounded"


>

Accept Order

</button>


}








{/* STATUS CHANGE DROPDOWN }
/*


{

[

"ACCEPTED",

"SHIPPED",

"OUT_FOR_DELIVERY"

].includes(order.status)


&&


<select


value={order.status}


onChange={(e)=>{


setSelectedStatusOrder(order);

setSelectedStatus(e.target.value);

setShowStatusPopup(true);


}}


className="border p-2 rounded"



>


<option value="ACCEPTED">

ACCEPTED

</option>



<option value="SHIPPED">

SHIPPED

</option>



<option value="OUT_FOR_DELIVERY">

OUT_FOR_DELIVERY

</option>



<option value="DELIVERED">

DELIVERED

</option>



</select>


}







{/* ADMIN CANCEL }



{

order.status!=="DELIVERED"

&&

order.status!=="CANCELLED"


&&


<button


onClick={()=>{


setSelectedOrder(order);

setShowCancelPopup(true);


}}



className="bg-red-600 text-white px-4 py-2 rounded"



>

Cancel Order

</button>



}




</div>


}


{


user?.role!=="ADMIN"

&&

order.status!=="DELIVERED"

&&

order.status!=="CANCELLED"



&&



<button


onClick={()=>{


setSelectedOrder(order);

setShowCancelPopup(true);


}}



className="mt-4 bg-red-600 text-white px-5 py-2 rounded"


>

Cancel Order

</button>


}


{

order.status==="CANCELLED"


&&


<div className="mt-4 bg-red-100 p-4 rounded">



<h3 className="font-bold text-red-600">

Order Cancelled

</h3>




<p>

Cancelled By :

<b className="ml-2">

{order.cancelledBy || "N/A"}

</b>

</p>





<p>

Cancellation Reason :

<span className="ml-2">

{order.cancelReason || "No reason provided"}

</span>


</p>



{

order.cancelledAt

&&


<p>


Cancelled At :

<span className="ml-2">


{

new Date(

order.cancelledAt

).toLocaleString()

}



</span>


</p>


}



</div>



}




</div>


))


}



</div>




{

showStatusPopup

&&


<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">


<div className="bg-white w-[450px] rounded-xl p-6">


<h2 className="text-2xl font-bold mb-4">

Change Order Status

</h2>




<p className="mb-3">

Are you sure you want to change order status to:

</p>



<h3 className="text-orange-600 font-bold text-xl mb-5">

{selectedStatus}

</h3>





<div className="flex justify-end gap-3">



<button


onClick={()=>{


setShowStatusPopup(false);

setSelectedStatus("");

setSelectedStatusOrder(null);


}}


className="bg-gray-400 text-white px-5 py-2 rounded"


>

Cancel

</button>







<button


onClick={updateStatus}


className="bg-green-600 text-white px-5 py-2 rounded"


>

Yes, Change

</button>



</div>



</div>


</div>


}

{

showCancelPopup


&&



<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">



<div className="bg-white w-[450px] rounded-xl p-6">



<h2 className="text-2xl font-bold mb-4">

Cancel Order

</h2>




<p className="mb-3">

Please enter cancellation reason

</p>





<textarea


value={cancelReason}


onChange={(e)=>

setCancelReason(e.target.value)

}



rows={5}



className="w-full border rounded-lg p-3"



placeholder="Write reason..."



/>







<div className="flex justify-end gap-3 mt-5">



<button


onClick={()=>{


setShowCancelPopup(false);

setCancelReason("");

setSelectedOrder(null);


}}



className="bg-gray-400 text-white px-5 py-2 rounded"



>

Close

</button>







<button


onClick={confirmCancelOrder}



className="bg-red-600 text-white px-5 py-2 rounded"



>

Save & Cancel Order

</button>





</div>



</div>



</div>



}





</>


)


}


export default MyOrders;
*/