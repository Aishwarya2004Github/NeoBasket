

/*import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import toast from "react-hot-toast";

const DeliveryPartnerDetails = () => {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDetails = async () => {
    try {
      const response = await Axios({
        url: `/api/delivery-partner/details/${id}`,
        method: "GET",
      });

      if (response.data.success) {
        setPartner(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase() || "PENDING";
    switch (statusUpper) {
      case "DELIVERED":
        return "bg-emerald-200 text-emerald-950 border-emerald-400";
      case "SHIPPED":
      case "DISPATCHED":
        return "bg-blue-200 text-blue-950 border-blue-400";
      case "PACKED":
        return "bg-amber-200 text-amber-950 border-amber-400";
      case "CANCELLED":
        return "bg-rose-200 text-rose-950 border-rose-400";
      default:
        return "bg-gray-200 text-gray-950 border-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-3 text-gray-900 font-semibold">
          <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading delivery partner details...</span>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-2xl shadow-md border border-gray-300 text-center">
        <h2 className="text-xl font-bold text-black">Partner Not Found</h2>
        <p className="text-gray-800 font-semibold mt-2">Could not find details for ID: {id}</p>
      </div>
    );
  }

  const orderList = partner.orders || [];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card Header }
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar }
            <div className="relative">
              <img
                src={
                  partner.photo
                    ? `http://localhost:8080${partner.photo}`
                    : "https://via.placeholder.com/100"
                }
                alt={partner.name}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-orange-300 shadow-sm"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-sm">
                Partner
              </span>
            </div>

            {/* Main Info }
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h1 className="text-2xl font-black text-black">{partner.name}</h1>
                <p className="text-sm font-extrabold text-orange-700 mt-0.5">
                  ID: #{partner.employeeId || "N/A"}
                </p>
              </div>

              {/* Contact Meta Grid }
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-sm text-black font-bold">
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-orange-600">📞</span>
                  <span>{partner.mobile || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-orange-600">✉️</span>
                  <span className="truncate">{partner.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 p-2.5 rounded-xl border border-gray-200 sm:col-span-2 lg:col-span-1">
                  <span className="text-orange-600">📍</span>
                  <span className="truncate">{partner.address || "No address listed"}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Counter }
            <div className="hidden lg:flex flex-col items-center justify-center bg-orange-100 border border-orange-300 p-4 rounded-2xl min-w-[120px]">
              <span className="text-3xl font-black text-orange-700">
                {orderList.length}
              </span>
              <span className="text-xs font-black text-black uppercase mt-1">
                Total Orders
              </span>
            </div>

          </div>
        </div>

        {/* Orders Table Section }
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black">Assigned Orders</h2>
            <span className="text-xs font-bold text-black bg-white px-3 py-1 rounded-full border border-gray-300">
              Showing {orderList.length} item(s)
            </span>
          </div>

          {orderList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-md border border-gray-300 text-center">
              <h3 className="text-base font-black text-black">No Assigned Orders</h3>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                This delivery partner doesn't have any assigned orders right now.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-black">
                  <thead className="bg-gray-200 text-black text-xs font-black uppercase tracking-wider border-b border-gray-300">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6 text-center">Qty</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 font-medium">
                    {orderList.map((order) => (
                      <tr
                        key={order.id || order.orderId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* Order ID }
                        <td className="py-4 px-6 font-black text-black whitespace-nowrap">
                          #{order.orderId}
                        </td>

                        {/* Customer/}
                        <td className="py-4 px-6">
                          <p className="font-bold text-black">
                            {order.user?.name || "N/A"}
                          </p>
                          <p className="text-xs font-bold text-gray-700">
                            {order.user?.mobile || "No phone"}
                          </p>
                        </td>

                        {/* Product }
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                order.product?.image
                                  ? `http://localhost:8080${order.product.image}`
                                  : "https://via.placeholder.com/70"
                              }
                              alt={order.product?.name || "Product"}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300 bg-white"
                            />
                            <span className="font-bold text-black line-clamp-1 max-w-[150px]">
                              {order.product?.name || "Product"}
                            </span>
                          </div>
                        </td>

                        {/* Quantity }
                        <td className="py-4 px-6 text-center font-black text-black">
                          {order.quantity || 1}
                        </td>

                        {/* Amount }
                        <td className="py-4 px-6 font-black text-orange-600 whitespace-nowrap">
                          ₹{order.totalAmt}
                        </td>

                        {/* Status }
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-black rounded-full border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status || "PENDING"}
                          </span>
                        </td>

                        {/* Date }
                        <td className="py-4 px-6 text-right text-xs font-bold text-gray-800 whitespace-nowrap">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DeliveryPartnerDetails;*/


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import toast from "react-hot-toast";

const DeliveryPartnerDetails = () => {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: `/api/delivery-partner/details/${id}`,
        method: "GET",
      });

      if (response.data.success) {
        setPartner(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Error fetching delivery partner details:", error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase() || "PENDING";
    switch (statusUpper) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
      case "DISPATCHED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PACKED":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading Delivery Partner Details...</span>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-800">Partner Not Found</h2>
          <p className="text-slate-500 text-sm mt-1">
            Could not find details for ID: <span className="font-mono text-slate-700">{id}</span>
          </p>
        </div>
      </div>
    );
  }

  const orderList = partner.orders || [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={
                  partner.photo
                    ? partner.photo.startsWith("http")
                      ? partner.photo
                      : `http://localhost:8080${partner.photo}`
                    : "/no-avatar.png"
                }
                alt={partner.name}
                className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shadow-sm bg-slate-100"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                Partner
              </span>
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center sm:text-left space-y-3 w-full">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Profile Details
                </span>
                <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
                <p className="text-xs font-mono font-semibold text-orange-600 mt-0.5">
                  Employee ID: #{partner.employeeId || "N/A"}
                </p>
              </div>

              {/* Contact Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs text-slate-700">
                <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  <span className="text-base">📞</span>
                  <span>{partner.mobile || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium truncate">
                  <span className="text-base">✉️</span>
                  <span className="truncate">{partner.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium sm:col-span-2 lg:col-span-1 truncate">
                  <span className="text-base">📍</span>
                  <span className="truncate">{partner.address || "No address listed"}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Counter */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-orange-50/60 border border-orange-100 p-5 rounded-2xl min-w-[130px]">
              <span className="text-3xl font-extrabold text-orange-600">
                {orderList.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">
                Total Orders
              </span>
            </div>

          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900">Assigned Orders</h2>
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              {orderList.length} Total
            </span>
          </div>

          {orderList.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
              <h3 className="text-base font-bold text-slate-800">No Assigned Orders</h3>
              <p className="text-xs text-slate-500 mt-1">
                This delivery partner doesn't have any assigned orders right now.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6 text-center">Qty</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orderList.map((order, idx) => {
                      const imageSrc =
                        order.product?.image ||
                        order.product_image?.[0] ||
                        "/no-image.png";

                      const fullImgUrl = imageSrc.startsWith("http")
                        ? imageSrc
                        : `http://localhost:8080${imageSrc}`;

                      return (
                        <tr
                          key={order.id || order.orderId || idx}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Order ID */}
                          <td className="py-4 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                            #{order.orderId}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900">
                              {order.user?.name || "N/A"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {order.user?.mobile || "No phone"}
                            </p>
                          </td>

                          {/* Product */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={fullImgUrl}
                                alt={order.product?.name || order.product_name || "Product"}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                              />
                              <span className="font-medium text-slate-800 line-clamp-1 max-w-[160px]">
                                {order.product?.name || order.product_name || "Product"}
                              </span>
                            </div>
                          </td>

                          {/* Quantity */}
                          <td className="py-4 px-6 text-center font-bold text-slate-800">
                            {order.quantity || 1}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-6 font-bold text-emerald-700 whitespace-nowrap">
                            ₹{order.totalAmt}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status || "PENDING"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-right text-[11px] text-slate-500 whitespace-nowrap">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DeliveryPartnerDetails;