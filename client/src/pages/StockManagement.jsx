import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaEdit,
  FaSyncAlt,
  FaSearch,
  FaCheckCircle,
  FaCalendarTimes,
  FaClock,
} from "react-icons/fa";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

// =========================================================
// IMAGE HELPER
// =========================================================

const getProductImage = (image) => {
  if (!image) return "";

  const imageUrl = Array.isArray(image) ? image[0] : image;

  if (!imageUrl) return "";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `http://localhost:8080${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
};

// =========================================================
// DATE HELPERS
// =========================================================

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

// =========================================================
// CHECK EXPIRED
// =========================================================

const isProductExpired = (expiryDate) => {
  if (!expiryDate) {
    return false;
  }

  const today = getTodayDate();

  let expiry;

  // If backend sends YYYY-MM-DD
  if (
    typeof expiryDate === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(expiryDate)
  ) {
    expiry = expiryDate.substring(0, 10);
  } else {
    const parsed = new Date(expiryDate);

    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    expiry = `${year}-${month}-${day}`;
  }

  return expiry < today;
};

// =========================================================
// COMPONENT
// =========================================================

const StockManagement = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await Axios({
        ...SummaryApi.getProduct,

        data: {
          page: 1,
          limit: 1000,
          search: "",
        },
      });

      const responseData = response?.data;

      if (responseData?.success) {
        setProducts(
          Array.isArray(responseData?.data)
            ? responseData.data
            : []
        );
      } else {
        toast.error(
          responseData?.message ||
            "Unable to fetch products"
        );
      }
    } catch (error) {
      console.error(
        "STOCK MANAGEMENT ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load stock data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // SEARCH HELPER
  // =========================================================

  const matchesSearch = (product) => {
    if (!search.trim()) {
      return true;
    }

    const searchText = search.trim().toLowerCase();

    return (
      String(product?.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(product?.category?.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(product?.subCategory?.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(product?.unit || "")
        .toLowerCase()
        .includes(searchText) ||
      String(product?.id || "")
        .toLowerCase()
        .includes(searchText)
    );
  };

  // =========================================================
  // EXPIRED PRODUCTS
  //
  // IMPORTANT:
  // Expired products are separated first.
  //
  // So even if expired product has:
  // stock 1
  // stock 2
  // stock 3
  // stock 10
  // stock 100
  //
  // it will ONLY appear in expired section.
  // =========================================================

  const expiredProducts = useMemo(() => {
    return products
      .filter((product) => {
        return isProductExpired(
          product?.expiryDate
        );
      })
      .filter((product) => {
        return matchesSearch(product);
      })
      .sort((a, b) => {
        const dateA = new Date(
          a?.expiryDate || 0
        ).getTime();

        const dateB = new Date(
          b?.expiryDate || 0
        ).getTime();

        return dateA - dateB;
      });
  }, [products, search]);

  // =========================================================
  // LOW STOCK PRODUCTS
  //
  // ONLY NON-EXPIRED PRODUCTS
  // AND STOCK <= 3
  // =========================================================

  const stockProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Expired products are NEVER shown here
        if (
          isProductExpired(
            product?.expiryDate
          )
        ) {
          return false;
        }

        const stock = Number(
          product?.stock ?? 0
        );

        return (
          Number.isFinite(stock) &&
          stock <= 3
        );
      })
      .filter((product) => {
        return matchesSearch(product);
      })
      .sort((a, b) => {
        return (
          Number(a?.stock ?? 0) -
          Number(b?.stock ?? 0)
        );
      });
  }, [products, search]);

  // =========================================================
  // OUT OF STOCK COUNT
  //
  // Includes:
  // 1. Normal products with stock 0
  // 2. Expired products because expired = unavailable
  // =========================================================

  const outOfStockCount = useMemo(() => {
    return products.filter((product) => {
      const expired = isProductExpired(
        product?.expiryDate
      );

      const stock = Number(
        product?.stock ?? 0
      );

      return expired || stock === 0;
    }).length;
  }, [products]);

  // =========================================================
  // LOW STOCK COUNT
  //
  // EXPIRED PRODUCTS EXCLUDED
  // =========================================================

  const lowStockCount = useMemo(() => {
    return products.filter((product) => {
      if (
        isProductExpired(
          product?.expiryDate
        )
      ) {
        return false;
      }

      const stock = Number(
        product?.stock ?? 0
      );

      return (
        stock > 0 &&
        stock <= 3
      );
    }).length;
  }, [products]);

  // =========================================================
  // EXPIRED COUNT
  // =========================================================

  const expiredCount = useMemo(() => {
    return products.filter((product) => {
      return isProductExpired(
        product?.expiryDate
      );
    }).length;
  }, [products]);

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEdit = (product) => {
    if (!product?.id) {
      toast.error(
        "Product ID not found"
      );

      return;
    }

    navigate(
      "/dashboard/product",
      {
        state: {
          editProduct: product,
          productId: product.id,
        },
      }
    );
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (stock) => {
    const currentStock = Number(
      stock ?? 0
    );

    if (currentStock <= 0) {
      return {
        label:
          "COMPLETELY OUT OF STOCK",

        shortLabel:
          "OUT OF STOCK",

        className:
          "bg-red-500/10 border-red-500/30 text-red-400",

        badgeClass:
          "bg-red-500/20 text-red-300 border-red-500/30",

        icon: <FaBoxOpen />,
      };
    }

    return {
      label:
        "LOW STOCK - REFILL REQUIRED",

      shortLabel:
        "LOW STOCK",

      className:
        "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",

      badgeClass:
        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",

      icon:
        <FaExclamationTriangle />,
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />

            <p className="text-slate-400 mt-4">
              Checking product stock...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="w-full space-y-6">

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* LOW STOCK */}

        <div className="bg-slate-900 border border-yellow-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Low Stock
              </p>

              <p className="text-3xl font-black text-yellow-400 mt-1">
                {lowStockCount}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Non-expired products with 1-3 stock
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <FaExclamationTriangle className="text-yellow-400 text-xl" />
            </div>

          </div>
        </div>

        {/* OUT OF STOCK */}

        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Completely Out
              </p>

              <p className="text-3xl font-black text-red-400 mt-1">
                {outOfStockCount}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Zero stock + expired products
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <FaBoxOpen className="text-red-400 text-xl" />
            </div>

          </div>
        </div>

        {/* EXPIRED */}

        <div className="bg-slate-900 border border-orange-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Expired Products
              </p>

              <p className="text-3xl font-black text-orange-400 mt-1">
                {expiredCount}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Automatically unavailable
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <FaCalendarTimes className="text-orange-400 text-xl" />
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          MAIN PANEL
      ===================================================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* HEADER */}

        <div className="p-5 lg:p-6 border-b border-slate-800">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-400" />
                Stock Management
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Low-stock products, out-of-stock products and expired products are managed here.
              </p>
            </div>

            {/* REFRESH */}

            <button
              onClick={() =>
                fetchProducts(true)
              }
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold transition disabled:opacity-50"
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* SEARCH */}

          <div className="relative mt-5">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
            />

          </div>

        </div>

        {/* ===================================================
            EXPIRED PRODUCTS
        =================================================== */}

        <div className="border-b border-slate-800">

          <div className="p-5 lg:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

              <div>

                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FaCalendarTimes className="text-orange-400" />

                  Expired Products

                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    {expiredProducts.length}
                  </span>
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Products past their expiry date are treated as unavailable/out of stock.
                </p>

              </div>

            </div>

            {/* NO EXPIRED PRODUCTS */}

            {expiredProducts.length === 0 ? (

              <div className="py-10 flex flex-col items-center justify-center text-center bg-slate-950/40 border border-slate-800 rounded-2xl">

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FaCheckCircle className="text-emerald-400 text-2xl" />
                </div>

                <h4 className="text-base font-black text-white mt-4">
                  No Expired Products
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  All products are currently within their expiry date.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

                {expiredProducts.map(
                  (product) => {

                    const originalStock =
                      Number(
                        product?.stock ?? 0
                      );

                    const image =
                      getProductImage(
                        product?.image
                      );

                    return (

                      <div
                        key={product?.id}
                        className="relative rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 transition-all hover:scale-[1.01]"
                      >

                        {/* STATUS */}

                        <div className="flex items-center justify-between gap-2 mb-4">

                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wide bg-orange-500/20 text-orange-300 border-orange-500/30">
                            <FaCalendarTimes />
                            EXPIRED
                          </span>

                          <span className="text-xs text-slate-500 truncate max-w-[130px]">
                            ID: {product?.id}
                          </span>

                        </div>

                        {/* PRODUCT */}

                        <div className="flex gap-4">

                          {/* IMAGE */}

                          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">

                            {image ? (

                              <img
                                src={image}
                                alt={
                                  product?.name ||
                                  "Product"
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {

                                  e.currentTarget.style.display =
                                    "none";

                                  const parent =
                                    e.currentTarget
                                      .parentElement;

                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center">
                                        <span style="color:#475569;font-size:24px;">
                                          📦
                                        </span>
                                      </div>
                                    `;
                                  }

                                }}
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center">
                                <FaBoxOpen className="text-slate-700 text-2xl" />
                              </div>

                            )}

                          </div>

                          {/* DETAILS */}

                          <div className="min-w-0 flex-1">

                            <h3 className="font-black text-white truncate">
                              {product?.name ||
                                "Unnamed Product"}
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                              {product?.category?.name ||
                                "No Category"}
                            </p>

                            {product?.subCategory?.name && (

                              <p className="text-xs text-slate-600 mt-0.5">
                                {
                                  product
                                    .subCategory
                                    .name
                                }
                              </p>

                            )}

                          </div>

                        </div>

                        {/* EXPIRED DATE */}

                        <div className="mt-5 rounded-xl bg-slate-950/70 border border-orange-500/20 p-4">

                          <div className="flex items-center justify-between gap-3">

                            <div>

                              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                Expiry Date
                              </p>

                              <p className="text-sm font-black text-orange-400 mt-1">
                                {formatDate(
                                  product?.expiryDate
                                )}
                              </p>

                            </div>

                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                              <FaCalendarTimes className="text-orange-400" />
                            </div>

                          </div>

                        </div>

                        {/* OUT OF STOCK DECLARATION */}

                        <div className="mt-3 rounded-xl bg-red-500/5 border border-red-500/20 p-4">

                          <div className="flex items-center justify-between gap-3">

                            <div>

                              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                Availability
                              </p>

                              <p className="text-sm font-black text-red-400 mt-1">
                                OUT OF STOCK
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                Original Stock
                              </p>

                              <p className="text-sm font-black text-white mt-1">
                                {originalStock}
                              </p>

                            </div>

                          </div>

                          <p className="text-[10px] text-slate-600 mt-2">
                            This product is unavailable because its expiry date has passed.
                          </p>

                        </div>

                        {/* PRICE + UNIT */}

                        <div className="grid grid-cols-2 gap-3 mt-3">

                          <div className="bg-slate-950/40 rounded-xl p-3">

                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                              Price
                            </p>

                            <p className="text-sm text-white font-bold mt-1">
                              ₹
                              {Number(
                                product?.price ?? 0
                              ).toFixed(2)}
                            </p>

                          </div>

                          <div className="bg-slate-950/40 rounded-xl p-3">

                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                              Unit / Lot
                            </p>

                            <p className="text-sm text-white font-bold mt-1 truncate">
                              {product?.unit ||
                                "-"}
                            </p>

                          </div>

                        </div>

                        {/* MANUFACTURING DATE */}

                        {product?.manufacturingDate && (

                          <div className="mt-3 flex items-center justify-between bg-slate-950/40 rounded-xl p-3">

                            <div className="flex items-center gap-2">

                              <FaClock className="text-slate-500" />

                              <span className="text-[10px] text-slate-500 uppercase font-bold">
                                Manufacturing
                              </span>

                            </div>

                            <span className="text-xs text-white font-bold">
                              {formatDate(
                                product?.manufacturingDate
                              )}
                            </span>

                          </div>

                        )}

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            handleEdit(product)
                          }
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 font-black text-sm transition-all active:scale-[0.98]"
                        >

                          <FaEdit />

                          Edit & Update Stock

                        </button>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

        {/* ===================================================
            LOW STOCK PRODUCTS
        =================================================== */}

        <div className="p-4 lg:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

            <div>

              <h3 className="text-lg font-black text-white flex items-center gap-2">

                <FaExclamationTriangle className="text-yellow-400" />

                Low Stock Products

                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                  {stockProducts.length}
                </span>

              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Only non-expired products with stock 3 or below are shown here.
              </p>

            </div>

          </div>

          {/* NO PRODUCTS */}

          {stockProducts.length === 0 ? (

            <div className="py-16 flex flex-col items-center justify-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">

                <FaCheckCircle className="text-emerald-400 text-3xl" />

              </div>

              <h3 className="text-lg font-black text-white mt-5">
                Stock Looks Good
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md">
                No non-expired product currently has stock of 3 or below.
              </p>

            </div>

          ) : (

            /* =================================================
               PRODUCTS GRID
            ================================================= */

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

              {stockProducts.map(
                (product) => {

                  const stock =
                    Number(
                      product?.stock ?? 0
                    );

                  const status =
                    getStockStatus(stock);

                  const image =
                    getProductImage(
                      product?.image
                    );

                  return (

                    <div
                      key={product?.id}
                      className={`relative rounded-2xl border p-4 ${status.className} transition-all hover:scale-[1.01]`}
                    >

                      {/* STATUS */}

                      <div className="flex items-center justify-between gap-2 mb-4">

                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wide ${status.badgeClass}`}
                        >
                          {status.icon}

                          {status.shortLabel}
                        </span>

                        <span className="text-xs text-slate-500 truncate max-w-[130px]">
                          ID: {product?.id}
                        </span>

                      </div>

                      {/* PRODUCT */}

                      <div className="flex gap-4">

                        {/* IMAGE */}

                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">

                          {image ? (

                            <img
                              src={image}
                              alt={
                                product?.name ||
                                "Product"
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {

                                console.error(
                                  "PRODUCT IMAGE ERROR:",
                                  image
                                );

                                e.currentTarget.style.display =
                                  "none";

                                const parent =
                                  e.currentTarget
                                    .parentElement;

                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <span style="color:#475569;font-size:24px;">
                                        📦
                                      </span>
                                    </div>
                                  `;
                                }

                              }}
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center">

                              <FaBoxOpen className="text-slate-700 text-2xl" />

                            </div>

                          )}

                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0 flex-1">

                          <h3 className="font-black text-white truncate">
                            {product?.name ||
                              "Unnamed Product"}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            {product?.category?.name ||
                              "No Category"}
                          </p>

                          {product?.subCategory?.name && (

                            <p className="text-xs text-slate-600 mt-0.5">
                              {
                                product
                                  .subCategory
                                  .name
                              }
                            </p>

                          )}

                        </div>

                      </div>

                      {/* STOCK */}

                      <div className="mt-5 rounded-xl bg-slate-950/60 border border-slate-800 p-4">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                              Current Stock
                            </p>

                            <p
                              className={`text-3xl font-black mt-1 ${
                                stock === 0
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {stock}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                              Status
                            </p>

                            <p
                              className={`text-xs font-black mt-1 ${
                                stock === 0
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {status.label}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* PRICE + UNIT */}

                      <div className="grid grid-cols-2 gap-3 mt-3">

                        <div className="bg-slate-950/40 rounded-xl p-3">

                          <p className="text-[10px] text-slate-500 uppercase font-bold">
                            Price
                          </p>

                          <p className="text-sm text-white font-bold mt-1">
                            ₹
                            {Number(
                              product?.price ?? 0
                            ).toFixed(2)}
                          </p>

                        </div>

                        <div className="bg-slate-950/40 rounded-xl p-3">

                          <p className="text-[10px] text-slate-500 uppercase font-bold">
                            Unit
                          </p>

                          <p className="text-sm text-white font-bold mt-1 truncate">
                            {product?.unit ||
                              "-"}
                          </p>

                        </div>

                      </div>

                      {/* EXPIRY DATE */}

                      {product?.expiryDate && (

                        <div className="mt-3 flex items-center justify-between bg-slate-950/40 rounded-xl p-3">

                          <div className="flex items-center gap-2">

                            <FaCalendarTimes className="text-slate-500" />

                            <span className="text-[10px] text-slate-500 uppercase font-bold">
                              Expiry
                            </span>

                          </div>

                          <span className="text-xs text-white font-bold">
                            {formatDate(
                              product?.expiryDate
                            )}
                          </span>

                        </div>

                      )}

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          handleEdit(product)
                        }
                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 font-black text-sm transition-all active:scale-[0.98]"
                      >

                        <FaEdit />

                        Edit & Update Stock

                      </button>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          INFO
      ===================================================== */}

      <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-4">

        <p className="text-xs text-cyan-300 font-bold">
          Stock & Expiry Rules
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Non-expired products with current stock{" "}
          <span className="text-white font-bold">
            3 or less
          </span>{" "}
          appear in Low Stock.
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Products whose expiry date has passed are moved to{" "}
          <span className="text-orange-400 font-bold">
            Expired Products
          </span>{" "}
          regardless of their current stock quantity.
        </p>

        <p className="text-xs text-slate-500 mt-1">
          An expired product is treated as{" "}
          <span className="text-red-400 font-bold">
            OUT OF STOCK / UNAVAILABLE
          </span>{" "}
          in this stock-management panel.
        </p>

      </div>

    </div>
  );
};

export default StockManagement;