import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const OrderTracking = () => {
  const user = useSelector((state) => state.user);

  const [orderId, setOrderId] = useState("");
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
    };
  };

  // =========================================================
  // SAFE DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // SAFE TIME FORMAT
  // =========================================================

  const formatTime = (date) => {
    if (!date) {
      return "Pending";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Pending";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // GET DELIVERY PARTNERS
  // =========================================================

  const getPartners = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/order/delivery-partners",
        {
          headers: getHeaders(),
        }
      );

      if (response.data?.success) {
        setPartners(response.data.data || []);
      }
    } catch (error) {
      console.error("GET PARTNERS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to get delivery partners"
      );
    }
  };

  // =========================================================
  // SEARCH ORDER
  // =========================================================

  const searchOrder = async () => {
    const cleanOrderId = orderId.trim();

    if (!cleanOrderId) {
      toast.error("Please enter Order ID");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/order/track-order",
        {
          orderId: cleanOrderId,
        },
        {
          headers: getHeaders(),
        }
      );

      if (response.data?.success) {
        const orderData = response.data.data || [];

        setOrders(orderData);

        // Set existing delivery partner
        if (orderData[0]?.deliveryPartnerId) {
          setDeliveryPartnerId(
            orderData[0].deliveryPartnerId
          );
        } else if (orderData[0]?.deliveryPartner?.id) {
          setDeliveryPartnerId(
            orderData[0].deliveryPartner.id
          );
        } else {
          setDeliveryPartnerId("");
        }
      } else {
        setOrders([]);
        toast.error(
          response.data?.message ||
            "Order not found"
        );
      }
    } catch (error) {
      console.error("TRACK ORDER ERROR:", error);

      setOrders([]);

      toast.error(
        error.response?.data?.message ||
          "Order Not Found"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ASSIGN DELIVERY PARTNER
  // =========================================================

  const assignPartner = async () => {
    if (!orders.length) {
      toast.error("Please search an order first");
      return;
    }

    if (!deliveryPartnerId) {
      toast.error("Select Delivery Partner");
      return;
    }

    try {
      setAssignLoading(true);

      const response = await axios.put(
        "http://localhost:8080/api/order/assign-delivery",
        {
          orderId: orders[0].orderId,
          deliveryPartnerId,
        },
        {
          headers: getHeaders(),
        }
      );

      if (response.data?.success) {
        toast.success(
          "Delivery Partner Assigned"
        );

        // Refresh order data
        await searchOrder();
      } else {
        toast.error(
          response.data?.message ||
            "Assignment Failed"
        );
      }
    } catch (error) {
      console.error(
        "ASSIGN PARTNER ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Assignment Failed"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // =========================================================
  // LOAD PARTNERS FOR ADMIN
  // =========================================================

  useEffect(() => {
    if (user?.role === "ADMIN") {
      getPartners();
    }
  }, [user]);

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "DISPATCHED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "OUT_FOR_DELIVERY":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "PACKED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "ACCEPTED":
        return "bg-teal-50 text-teal-700 border-teal-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // =========================================================
  // STATUS TEXT
  // =========================================================

  const getStatusText = (status) => {
    if (!status) {
      return "PENDING";
    }

    return status.replaceAll("_", " ");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Order Tracking
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Track order status, delivery details, and
            assign partners in real-time.
          </p>
        </div>

        <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 text-lg">
          📍
        </div>
      </div>

      {/* =====================================================
          SEARCH ORDER
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Search Order ID
        </label>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            placeholder="Enter Order ID (e.g., ORD-XXXXXXXX)"
            value={orderId}
            onChange={(e) =>
              setOrderId(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchOrder();
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
          />

          <button
            onClick={searchOrder}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading
              ? "Searching..."
              : "Track Order"}
          </button>
        </div>
      </div>

      {/* =====================================================
          ORDER DETAILS
      ====================================================== */}

      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">

          {/* =================================================
              ORDER ID + PLACED DATE
          ================================================== */}

          <div className="p-6 space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">

              {/* ORDER ID */}

              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Order Identifier
                </span>

                <h2 className="text-xl font-extrabold text-orange-600 font-mono mt-0.5">
                  #{orders[0]?.orderId || "N/A"}
                </h2>
              </div>

              {/* PLACED ON */}

              <div className="text-right">

                <span className="text-xs text-slate-400 font-medium">
                  Placed On
                </span>

                <p className="text-xs font-bold text-slate-700 mt-1">
                  {formatDate(
                    orders[0]?.createdAt
                  )}
                </p>

              </div>

            </div>

            {/* =================================================
                CUSTOMER INFORMATION
            ================================================== */}

            <div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">

                {/* NAME */}

                <div>
                  <span className="text-slate-400 font-medium block">
                    Name
                  </span>

                  <span className="font-bold text-slate-800">
                    {orders[0]?.user?.name ||
                      "N/A"}
                  </span>
                </div>

                {/* EMAIL */}

                <div>
                  <span className="text-slate-400 font-medium block">
                    Email
                  </span>

                  <span className="font-bold text-slate-800 truncate block">
                    {orders[0]?.user?.email ||
                      "N/A"}
                  </span>
                </div>

                {/* MOBILE */}

                <div>
                  <span className="text-slate-400 font-medium block">
                    Mobile
                  </span>

                  <span className="font-bold text-slate-800">
                    {orders[0]?.user?.mobile ||
                      "N/A"}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCTS
          ================================================== */}

          <div className="p-6 space-y-4">

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ordered Products ({orders.length})
            </h3>

            <div className="space-y-3">

              {orders.map((item, index) => (

                <div
                  key={item.id || index}
                  className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors"
                >

                  <div className="flex items-start justify-between gap-4">

                    {/* PRODUCT */}

                    <div className="min-w-0">

                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.product_name ||
                          item.product?.name ||
                          "Product"}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Quantity:{" "}
                        <span className="font-semibold text-slate-700">
                          {item.quantity || 1}
                        </span>
                      </p>

                    </div>

                    {/* AMOUNT + STATUS */}

                    <div className="text-right shrink-0">

                      <span className="text-sm font-bold text-slate-900 block">
                        ₹
                        {Number(
                          item.totalAmt || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {getStatusText(
                          item.status
                        )}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      CANCELLED ALERT
                  ================================================== */}

                  {item.status ===
                    "CANCELLED" && (

                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-1.5 text-xs">

                      <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                        <span>⚠️</span>
                        Order Cancelled
                      </div>

                      <p className="text-rose-800">
                        <span className="font-semibold">
                          Cancelled By:
                        </span>{" "}
                        {item.cancelledBy ||
                          "N/A"}
                      </p>

                      <p className="text-rose-800">
                        <span className="font-semibold">
                          Reason:
                        </span>{" "}
                        {item.cancelReason ||
                          "No reason provided"}
                      </p>

                      {item.cancelledAt && (
                        <p className="text-rose-600 text-[11px] pt-1">
                          At:{" "}
                          {formatDate(
                            item.cancelledAt
                          )}
                        </p>
                      )}

                    </div>
                  )}

                </div>

              ))}

            </div>

          </div>

          {/* =================================================
              ADDRESS + DELIVERY PARTNER
          ================================================== */}

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* =================================================
                DELIVERY ADDRESS
            ================================================== */}

            <div className="space-y-3">

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Address
              </h3>

              <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl text-xs space-y-1 text-slate-700">

                <p className="font-semibold text-slate-900">
                  {orders[0]
                    ?.delivery_address
                    ?.address_line ||
                    "No address line"}
                </p>

                <p>
                  {orders[0]
                    ?.delivery_address
                    ?.city ||
                    "N/A"}
                  {orders[0]
                    ?.delivery_address
                    ?.state
                    ? `, ${orders[0].delivery_address.state}`
                    : ""}
                </p>

                {orders[0]
                  ?.delivery_address
                  ?.country && (
                  <p>
                    {
                      orders[0]
                        .delivery_address
                        .country
                    }
                  </p>
                )}

                <p className="font-mono text-orange-600 font-bold">
                  Pincode:{" "}
                  {orders[0]
                    ?.delivery_address
                    ?.pincode ||
                    "N/A"}
                </p>

                {orders[0]
                  ?.delivery_address
                  ?.mobile && (
                  <p className="text-slate-600">
                    Mobile:{" "}
                    {
                      orders[0]
                        .delivery_address
                        .mobile
                    }
                  </p>
                )}

              </div>

            </div>

            {/* =================================================
                DELIVERY PARTNER
            ================================================== */}

            <div className="space-y-3">

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Partner
              </h3>

              {orders[0]?.deliveryPartner ? (

                <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-xl text-xs space-y-1.5">

                  <div className="flex items-center justify-between gap-3">

                    <span className="font-bold text-slate-900 text-sm">
                      {
                        orders[0]
                          .deliveryPartner
                          .name
                      }
                    </span>

                    <span className="font-mono text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      #
                      {
                        orders[0]
                          .deliveryPartner
                          .employeeId
                      }
                    </span>

                  </div>

                  <p className="text-slate-600">
                    📞{" "}
                    {
                      orders[0]
                        .deliveryPartner
                        .mobile
                    }
                  </p>

                  {orders[0]
                    .deliveryPartner
                    .email && (
                    <p className="text-slate-500 truncate">
                      ✉️{" "}
                      {
                        orders[0]
                          .deliveryPartner
                          .email
                      }
                    </p>
                  )}

                </div>

              ) : (

                <div className="bg-slate-50/80 border border-dashed border-slate-200 p-4 rounded-xl text-xs text-slate-400 text-center font-medium">
                  No delivery partner assigned yet.
                </div>

              )}

            </div>

          </div>

          {/* =================================================
              ADMIN ASSIGN PARTNER
          ================================================== */}

          {user?.role === "ADMIN" && (

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-3">

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Assign Delivery Partner
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">

                <select
                  value={deliveryPartnerId}
                  onChange={(e) =>
                    setDeliveryPartnerId(
                      e.target.value
                    )
                  }
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                >

                  <option value="">
                    Select Partner
                  </option>

                  {partners.map(
                    (partner) => (
                      <option
                        key={partner.id}
                        value={partner.id}
                      >
                        {partner.name} - (
                        {partner.mobile})
                      </option>
                    )
                  )}

                </select>

                <button
                  onClick={assignPartner}
                  disabled={assignLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignLoading
                    ? "Assigning..."
                    : "Assign Partner"}
                </button>

              </div>

            </div>

          )}

          {/* =================================================
              FULFILLMENT TIMELINE
          ================================================== */}

          <div className="p-6 space-y-4">

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fulfillment Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">

              {/* =================================================
                  CREATED
              ================================================== */}

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">

                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Created
                </span>

                <span className="font-semibold text-slate-800">
                  {formatTime(
                    orders[0]?.createdAt
                  )}
                </span>

              </div>

              {/* =================================================
                  PACKED
              ================================================== */}

              <div
                className={`p-3 border rounded-xl ${
                  orders[0]?.packedAt
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                }`}
              >

                <span className="text-[10px] uppercase font-bold block">
                  📦 Packed
                </span>

                <span className="font-semibold">
                  {formatTime(
                    orders[0]?.packedAt
                  )}
                </span>

              </div>

              {/* =================================================
                  SHIPPED
              ================================================== */}

              <div
                className={`p-3 border rounded-xl ${
                  orders[0]?.shippedAt
                    ? "bg-blue-50/50 border-blue-100 text-blue-900"
                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                }`}
              >

                <span className="text-[10px] uppercase font-bold block">
                  🚚 Shipped
                </span>

                <span className="font-semibold">
                  {formatTime(
                    orders[0]?.shippedAt
                  )}
                </span>

              </div>

              {/* =================================================
                  DELIVERED
              ================================================== */}

              <div
                className={`p-3 border rounded-xl ${
                  orders[0]?.deliveredAt
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                }`}
              >

                <span className="text-[10px] uppercase font-bold block">
                  ✅ Delivered
                </span>

                <span className="font-semibold">
                  {formatTime(
                    orders[0]?.deliveredAt
                  )}
                </span>

              </div>

            </div>

            {/* =================================================
                EXTRA TIMELINE DETAILS
            ================================================== */}

            {(orders[0]?.confirmedAt ||
              orders[0]?.dispatchedAt ||
              orders[0]?.outForDeliveryAt) && (

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">

                {/* CONFIRMED */}

                {orders[0]?.confirmedAt && (
                  <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-teal-900">

                    <span className="text-[10px] uppercase font-bold block">
                      ✓ Confirmed
                    </span>

                    <span className="font-semibold">
                      {formatTime(
                        orders[0]
                          .confirmedAt
                      )}
                    </span>

                  </div>
                )}

                {/* DISPATCHED */}

                {orders[0]?.dispatchedAt && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-indigo-900">

                    <span className="text-[10px] uppercase font-bold block">
                      🚛 Dispatched
                    </span>

                    <span className="font-semibold">
                      {formatTime(
                        orders[0]
                          .dispatchedAt
                      )}
                    </span>

                  </div>
                )}

                {/* OUT FOR DELIVERY */}

                {orders[0]
                  ?.outForDeliveryAt && (
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-900">

                    <span className="text-[10px] uppercase font-bold block">
                      🛵 Out For Delivery
                    </span>

                    <span className="font-semibold">
                      {formatTime(
                        orders[0]
                          .outForDeliveryAt
                      )}
                    </span>

                  </div>
                )}

              </div>

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          NO RESULT
      ====================================================== */}

      {!loading &&
        orderId &&
        orders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">

            <div className="text-4xl mb-3">
              🔎
            </div>

            <h3 className="font-bold text-slate-800">
              No Order Found
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Please check the Order ID and try
              again.
            </p>

          </div>
        )}

    </div>
  );
};

export default OrderTracking;