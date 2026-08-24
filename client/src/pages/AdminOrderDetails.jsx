import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/order/admin-order-list",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = res.data.data.find((item) => item.orderId === orderId);

      if (data) {
        setOrder(data);
        setStatus(data.status || "PENDING");
        setDeliveryPartnerId(data.deliveryPartnerId || "");
      }
    } catch (error) {
      console.log("Error fetching order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryPartners = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/order/delivery-partners",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        setPartners(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching partners:", error);
    }
  };

  const updateStatus = async () => {
    try {
      const res = await axios.put(
        "http://localhost:8080/api/order/update-status",
        {
          orderId,
          status,
          deliveryPartnerId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Order Updated Successfully");
        getOrder();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    getOrder();
    getDeliveryPartners();
  }, [orderId]);

  // Helper for Status Badge Color
  const getStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PACKED":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "SHIPPED":
      case "DISPATCHED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading Order Details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">
          No order matches the ID #{orderId}
        </p>
      </div>
    );
  }

  // Address fallback logic (in case order is an array or object)
  const address = order.delivery_address || order[0]?.delivery_address;
  const createdAt = order.createdAt || order[0]?.createdAt;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Dashboard
            </span>
            <h1 className="text-2xl font-bold text-slate-900 font-mono">
              Order #{order.orderId}
            </h1>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase ${getStatusBadge(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          {/* Customer & Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            {/* Customer Details */}
            <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-2">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Customer Info
              </h2>
              <p className="text-sm text-slate-700">
                Name: <b className="text-slate-900">{order.user?.name || "N/A"}</b>
              </p>
              <p className="text-sm text-slate-700">
                Email: <span className="text-slate-900">{order.user?.email || "N/A"}</span>
              </p>
              <p className="text-sm text-slate-700">
                Mobile: <span className="text-slate-900">{order.user?.mobile || "N/A"}</span>
              </p>
            </div>

            {/* Delivery Address */}
            <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-1">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Shipping Address
              </h2>
              {address ? (
                <>
                  <p className="text-sm text-slate-900 font-medium">{address.address_line}</p>
                  <p className="text-sm text-slate-600">
                    {address.city}, {address.state} - <b className="text-slate-800">{address.pincode}</b>
                  </p>
                  <p className="text-xs text-slate-500 pt-1">
                    Contact: {address.mobile}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400 italic">No address provided</p>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs text-slate-400">
              Product Overview
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl">
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
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  {order.product_name || "Product Name N/A"}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs pt-1">
                  <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-medium">
                    Quantity: {order.quantity || 1}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100 font-bold">
                    Total Amount: ₹{order.totalAmt}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Order Lifecycle Timeline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Created</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Packed</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {order.packedAt ? new Date(order.packedAt).toLocaleString() : "Not packed"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Shipped</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {order.shippedAt ? new Date(order.shippedAt).toLocaleString() : "Not shipped"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Delivered</p>
                <p className="font-bold text-slate-800 mt-0.5">
                  {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "Not delivered"}
                </p>
              </div>
            </div>
          </div>

          {/* Update Order Actions */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              Management Controls
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <select
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="PACKED">PACKED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <select
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer flex-1"
                value={deliveryPartnerId}
                onChange={(e) => setDeliveryPartnerId(e.target.value)}
              >
                <option value="">-- Assign Delivery Partner --</option>
                {partners.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} ({p.mobile})
                  </option>
                ))}
              </select>

              <button
                onClick={updateStatus}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;

/*import React,{useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";


const AdminOrderDetails=()=>{

const {orderId}=useParams();

const [order,setOrder]=useState([]);
const [status,setStatus]=useState("");
const [deliveryPartnerId,setDeliveryPartnerId]=useState("");

const [partners,setPartners]=useState([]);


const getOrder=async()=>{

try{

const res=await axios.get(
`http://localhost:8080/api/order/admin-order-list`,
{
headers:{
Authorization:
`Bearer ${localStorage.getItem("token")}`
}
}
);


const data=res.data.data.find(
(item)=>item.orderId===orderId
);


if(data){

setOrder(data);
setStatus(data.status);
setDeliveryPartnerId(
data.deliveryPartnerId || ""
);

}

}catch(error){

console.log(error);

}

};



const getDeliveryPartners=async()=>{

try{

const res=await axios.get(
"http://localhost:8080/api/order/delivery-partners",
{
headers:{
Authorization:
`Bearer ${localStorage.getItem("token")}`
}
}
);


if(res.data.success){

setPartners(res.data.data);

}


}catch(error){

console.log(error);

}

};



const updateStatus=async()=>{

try{


const res=await axios.put(

"http://localhost:8080/api/order/update-status",

{
orderId,
status,
deliveryPartnerId
},

{
headers:{
Authorization:
`Bearer ${localStorage.getItem("token")}`
}
}

);



if(res.data.success){

toast.success("Order Updated");

getOrder();

}


}catch(error){

toast.error(
error.response?.data?.message
||"Update failed"
);

}

};



useEffect(()=>{

getOrder();
getDeliveryPartners();

},[]);



if(!order){

return <h1 className="p-5">
Loading...
</h1>

}



return(

<div className="p-5">


<h1 className="text-2xl font-bold mb-5">
Order Details
</h1>



<div className="bg-white shadow rounded p-5">


<h2 className="font-bold">
Order ID : {order.orderId}
</h2>


<p>
Customer : {order.user?.name}
</p>


<p>
Email : {order.user?.email}
</p>


<p>
Mobile : {order.user?.mobile}
</p>



<hr className="my-4"/>



<h2 className="font-bold">
Product Details
</h2>


<img
src={
order.product_image?.[0]
}
className="w-32 h-32 object-cover"
/>


<p>
Product : {order.product_name}
</p>


<p>
Quantity : {order.quantity || 1}
</p>


<p>
Amount : ₹{order.totalAmt}
</p>



<hr className="my-4"/>



<h2 className="font-bold">
Delivery Address
</h2>


<p>
{order[0]?.delivery_address?.address_line}
</p>

<p>
{order[0]?.delivery_address?.city}
</p>

<p>
{order[0]?.delivery_address?.state}
</p>

<p>
PIN :
{order[0]?.delivery_address?.pincode}
</p>

<p>
Mobile :
{order[0]?.delivery_address?.mobile}
</p>



<hr className="my-4"/>



<h2 className="font-bold">
Order Timeline
</h2>


<p>
Created :
{
new Date(order[0]?.createdAt)
.toLocaleString()
}
</p>


<p>
Packed :
{
order.packedAt?
new Date(order.packedAt)
.toLocaleString()
:"Not packed"
}
</p>


<p>
Shipped :
{
order.shippedAt?
new Date(order.shippedAt)
.toLocaleString()
:"Not shipped"
}
</p>


<p>
Delivered :
{
order.deliveredAt?
new Date(order.deliveredAt)
.toLocaleString()
:"Not delivered"
}
</p>



<hr className="my-4"/>



<h2 className="font-bold mb-3">
Update Order
</h2>



<select

className="border p-2 mr-3"

value={status}

onChange={(e)=>
setStatus(e.target.value)
}

>


<option>
PENDING
</option>

<option>
PACKED
</option>

<option>
SHIPPED
</option>

<option>
DISPATCHED
</option>

<option>
DELIVERED
</option>

<option>
CANCELLED
</option>


</select>




<select

className="border p-2 mr-3"

value={deliveryPartnerId}

onChange={(e)=>
setDeliveryPartnerId(e.target.value)
}

>


<option value="">
Assign Delivery Partner
</option>


{
partners.map((p)=>(

<option
key={p.id}
value={p.id}
>

{p.name} - {p.mobile}

</option>

))
}



</select>




<button

onClick={updateStatus}

className="bg-orange-500 text-white px-5 py-2 rounded"

>

Update

</button>




</div>


</div>

)

}


export default AdminOrderDetails;*/