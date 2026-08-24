import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/order/admin-order-list",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
          },
        }
      );

      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // Helper function for status styling
  const getStatusBadge = (status) => {
    switch (status) {
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
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading Orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Portal
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Customer Orders
            </h1>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Total Orders: {orders.length}
          </span>
        </div>

        {/* Orders List / Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-500 font-medium text-lg">No Orders Found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              // Address & Date Fallbacks
              const address = order.delivery_address || order[0]?.delivery_address;
              const createdAt = order.createdAt || order[0]?.createdAt;
              
              // Image logic
              const imageSrc =
                order.product?.image?.[0] ||
                order.product_image?.[0] ||
                "/no-image.png";

              const fullImageSrc = imageSrc.startsWith("http")
                ? imageSrc
                : `http://localhost:8080${imageSrc}`;

              return (
                <div
                  key={order.orderId || index}
                  className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl p-6 space-y-5"
                >
                  {/* Top Bar: Customer Info & Status Badge */}
                  <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Customer Info
                      </span>
                      <h2 className="font-bold text-lg text-slate-900">
                        {order.user?.name || "N/A"}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                        <p>Email: <span className="text-slate-800">{order.user?.email || "N/A"}</span></p>
                        <p>Mobile: <span className="text-slate-800">{order.user?.mobile || "N/A"}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || "PENDING"}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Order Ref & Product */}
                    <div className="space-y-3 md:col-span-1">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          Order Reference
                        </span>
                        <p className="font-mono font-bold text-slate-800 text-sm">
                          #{order.orderId}
                        </p>
                      </div>

                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          Product Details
                        </span>
                        <div className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
                          <img
                            src={fullImageSrc}
                            alt={order.product_name}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {order.product_name}
                            </p>
                            <p className="text-slate-600">
                              Qty: <b className="text-slate-900">{order.quantity || 1}</b>
                            </p>
                            <p className="font-bold text-emerald-700">
                              ₹{order.totalAmt}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Delivery Address */}
                    <div className="space-y-2 md:col-span-1 bg-slate-50/70 border border-slate-100 p-4 rounded-xl">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Shipping Address
                      </span>
                      {address ? (
                        <div className="text-xs text-slate-700 space-y-1">
                          <p className="font-semibold text-slate-900">
                            {address.address_line}
                          </p>
                          <p>
                            {address.city}, {address.state}
                          </p>
                          <p className="text-slate-500">
                            Pincode: <b className="text-slate-800">{address.pincode}</b>
                          </p>
                          <p className="text-slate-500 pt-1">
                            Mobile: <b className="text-slate-800">{address.mobile}</b>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No address provided</p>
                      )}
                    </div>

                    {/* Column 3: Payment & Meta */}
                    <div className="space-y-3 md:col-span-1 bg-slate-50/70 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
                      <div className="space-y-2 text-xs">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                          Payment & Metadata
                        </span>
                        <p className="text-slate-600">
                          Payment Status:{" "}
                          <span className="font-bold text-slate-900 uppercase">
                            {order.payment_status || "PENDING"}
                          </span>
                        </p>
                        <p className="text-slate-600">
                          Ordered On:{" "}
                          <span className="font-semibold text-slate-800">
                            {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigate(`/admin/order-details/${order.orderId}`);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 mt-4"
                      >
                        View Order Details
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

/*import React,{useEffect,useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";


const AdminOrders=()=>{

const [orders,setOrders]=useState([]);
const navigate=useNavigate();


const getOrders=async()=>{

try{

const res=await axios.get(
"http://localhost:8080/api/order/admin-order-list",
{
headers:{
Authorization:
`Bearer ${localStorage.getItem("accesstoken")}`
}
}
);


if(res.data.success){

setOrders(res.data.data);

}


}catch(error){

console.log(error);

}

};



useEffect(()=>{

getOrders();

},[]);



return(

<div className="container mx-auto p-5">


<h1 className="text-2xl font-bold mb-5">
Customer Orders
</h1>



{
orders.length===0 ?

<p>No Orders Found</p>

:

orders.map((order)=>(


<div
key={order.orderId}
className="bg-white shadow-md p-5 mb-5 rounded-xl border"
>


<div className="flex justify-between items-center">


<div>

<h2 className="font-bold text-lg">
Customer : {order.user?.name}
</h2>


<p>
Email : {order.user?.email}
</p>


<p>
Mobile : {order.user?.mobile}
</p>


</div>



<div>


<span
className="
px-3 py-1 
rounded-full 
bg-yellow-100
font-semibold
"
>

{order.status}

</span>


</div>


</div>



<hr className="my-4"/>



<h3 className="font-bold">
Order ID
</h3>


<p className="mb-3">
{order.orderId}
</p>



<h3 className="font-bold">
Product Details
</h3>


<div className="flex gap-4 mt-2">


{
order.product?.image?.length>0 &&

<img
src={order.product.image[0]}
className="w-20 h-20 object-cover rounded"
/>

}



<div>


<p>
Name : {order.product_name}
</p>


<p>
Quantity : {order.quantity || 1}
</p>


<p>
Amount : ₹{order.totalAmt}
</p>


</div>


</div>



<hr className="my-4"/>



<h3 className="font-bold">
Delivery Address
</h3>


<p>
{order[0]?.delivery_address?.address_line}
</p>


<p>
{order[0]?.delivery_address?.city},
{order[0]?.delivery_address?.state}
</p>


<p>
Pincode :
{order[0]?.delivery_address?.pincode}
</p>


<p>
Mobile :
{order[0]?.delivery_address?.mobile}
</p>



<hr className="my-4"/>



<div>


<p>
Payment :
<b>{order.payment_status}</b>
</p>



<p>
Created At :
{new Date(order[0]?.createdAt).toLocaleString()}
</p>


</div>



<button

onClick={()=>{

navigate(
`/admin/order-details/${order.orderId}`
)

}}

className="
mt-4
bg-blue-600
text-white
px-5
py-2
rounded-lg
"

>

View Order Tracking

</button>



</div>


))


}



</div>

)


}


export default AdminOrders;*/