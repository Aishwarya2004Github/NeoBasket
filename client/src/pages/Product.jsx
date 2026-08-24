import React, { useCallback, useEffect, useState } from "react";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";

const Product = () => {
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProductData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await Axios({
          ...SummaryApi.getProduct,
          data: {
            page
          }
        });

        const { data: responseData } = response;

        console.log(
          "PRODUCT STOCK UPDATE:",
          responseData
        );

        if (responseData?.success) {
          setProductData(
            responseData.data || []
          );
        }
      } catch (error) {
        AxiosToastError(error);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [page]
  );

  // Initial product fetch
  useEffect(() => {
    fetchProductData(true);
  }, [fetchProductData]);

  // =====================================================
  // AUTO REFRESH STOCK
  // Every 5 seconds latest stock comes from backend
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProductData(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchProductData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm flex items-center justify-between mb-6">
        <h1 className="font-bold text-lg text-neutral-800 tracking-tight">
          All Products
        </h1>

        <span className="text-xs font-bold bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-full">
          Page {page}
        </span>
      </div>

      {/* PRODUCTS */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

        {/* LOADING */}

        {loading && productData.length === 0 ? (
          Array.from({ length: 12 }).map(
            (_, idx) => (
              <div
                key={idx}
                className="border border-neutral-200 rounded-xl p-3 bg-white space-y-3 animate-pulse"
              >
                <div className="w-full aspect-square bg-neutral-100 rounded-lg" />

                <div className="h-4 bg-neutral-100 rounded w-5/6 mx-auto" />

                <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto" />
              </div>
            )
          )
        ) : (
          productData?.map(
            (product, index) => {

              const img =
                product.image?.[0];

              const stock =
                Number(product.stock || 0);

              const isOutOfStock =
                product.isOutOfStock ||
                stock <= 0;

              const isLowStock =
                !isOutOfStock &&
                (
                  product.stockStatus ===
                    "LOW_STOCK" ||
                  stock <= 5
                );

              return (
                <div
                  key={
                    product.id ||
                    product._id ||
                    index
                  }
                  className={`
                    bg-white
                    border
                    rounded-xl
                    overflow-hidden
                    shadow-sm
                    transition-all
                    duration-200
                    flex
                    flex-col
                    justify-between
                    group

                    ${
                      isOutOfStock
                        ? "border-red-200"
                        : isLowStock
                        ? "border-orange-200"
                        : "border-neutral-200 hover:shadow-md"
                    }
                  `}
                >

                  {/* IMAGE */}

                  <div className="w-full aspect-square bg-neutral-50 p-3 flex items-center justify-center border-b border-neutral-100 relative overflow-hidden">

                    {/* OUT OF STOCK */}

                    {isOutOfStock && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        OUT OF STOCK
                      </div>
                    )}

                    {/* LOW STOCK */}

                    {!isOutOfStock &&
                      isLowStock && (
                        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          LOW STOCK
                        </div>
                      )}

                    <img
                      src={
                        img
                          ? img.startsWith(
                              "http"
                            )
                            ? img
                            : `http://localhost:8080${img}`
                          : "/placeholder.png"
                      }
                      alt={product.name}
                      className={`
                        max-w-full
                        max-h-full
                        object-contain
                        mix-blend-multiply
                        transition-transform
                        duration-200

                        ${
                          isOutOfStock
                            ? "opacity-50 grayscale"
                            : "group-hover:scale-105"
                        }
                      `}
                      loading="lazy"
                    />
                  </div>

                  {/* DETAILS */}

                  <div className="p-3 flex flex-col gap-1 bg-white text-center">

                    <h2
                      className="text-sm font-bold text-neutral-800 line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </h2>

                    <p className="text-base font-extrabold text-neutral-900">
                      ₹{product.price}
                    </p>

                    {/* STOCK */}

                    {isOutOfStock ? (
                      <p className="text-xs font-bold text-red-500">
                        Out of Stock
                      </p>
                    ) : isLowStock ? (
                      <p className="text-xs font-bold text-orange-500">
                        Only {stock} left
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-green-600">
                        Stock: {stock}
                      </p>
                    )}

                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      {/* EMPTY */}

      {!loading &&
        productData.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-neutral-500 font-medium">
              No products found
            </p>
          </div>
        )}
    </div>
  );
};

export default Product;