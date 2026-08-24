import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useParams } from "react-router-dom";

import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";

import {
  FaAngleRight,
  FaAngleLeft,
} from "react-icons/fa6";

import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";

import Divider from "../components/Divider";

import image1 from "../assets/minute_delivery.png";
import image2 from "../assets/Best_Prices_Offers.png";
import image3 from "../assets/Wide_Assortment.png";

import { pricewithDiscount } from "../utils/PriceWithDiscount";

import AddToCartButton from "../components/AddToCartButton";


const ProductDisplayPage = () => {
  const params = useParams();

  const productParam = params?.product || "";

  const productId = productParam.slice(-36);


  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const [data, setData] = useState({
    id: productId,

    name: "",
    image: [],
    description: "",
    unit: "",

    price: 0,
    discount: 0,

    stock: 0,

    manufacturingDate: "",
    expiryDate: "",

    more_details: {},
  });


  // =========================================================
  // UI STATES
  // =========================================================

  const [image, setImage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [stockLoading, setStockLoading] = useState(false);

  const imageContainer = useRef(null);


  // =========================================================
  // IMAGE URL
  // =========================================================

  const getImageUrl = (img) => {
    if (!img) {
      return "";
    }

    if (
      typeof img === "string" &&
      img.startsWith("http")
    ) {
      return img;
    }

    return `http://localhost:8080${img}`;
  };


  // =========================================================
  // STOCK
  // =========================================================

  const getSafeStock = (stock) => {
    const value = Number(stock);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return 0;
    }

    return Math.floor(value);
  };


  // =========================================================
  // DATE NORMALIZER
  // IMPORTANT
  // =========================================================

  const getManufacturingDate = (product) => {
    if (!product) {
      return "";
    }

    return (
      product.manufacturingDate ||
      product.manufacturing_date ||
      product.manufactureDate ||
      product.manufacture_date ||
      product.mfgDate ||
      product.mfg_date ||
      product.mfd ||
      product.MFD ||
      ""
    );
  };


  const getExpiryDate = (product) => {
    if (!product) {
      return "";
    }

    return (
      product.expiryDate ||
      product.expiry_date ||
      product.expirationDate ||
      product.expiration_date ||
      product.expireDate ||
      product.expire_date ||
      product.expiry ||
      product.expiration ||
      ""
    );
  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (
      date === null ||
      date === undefined ||
      date === ""
    ) {
      return "";
    }

    try {
      let parsedDate;

      /*
       * MongoDB / ISO date
       */
      if (
        typeof date === "object" &&
        date?.$date
      ) {
        parsedDate = new Date(date.$date);
      }

      /*
       * Normal string/date
       */
      else {
        parsedDate = new Date(date);
      }

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return "";
      }

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch (error) {
      console.error(
        "DATE FORMAT ERROR:",
        error
      );

      return "";
    }
  };


  // =========================================================
  // RAW DATE DEBUG
  // =========================================================

  const getRawDate = (date) => {
    if (!date) {
      return "";
    }

    if (
      typeof date === "object" &&
      date?.$date
    ) {
      return date.$date;
    }

    return date;
  };


  // =========================================================
  // EXPIRY CHECK
  // =========================================================

  const isProductExpired = useCallback(() => {
    if (!data?.expiryDate) {
      return false;
    }

    const rawExpiryDate =
      getRawDate(data.expiryDate);

    const expiry = new Date(
      rawExpiryDate
    );

    if (
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return false;
    }

    return expiry < new Date();
  }, [data?.expiryDate]);


  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  const fetchProductDetails =
    useCallback(
      async ({
        showLoader = true,
      } = {}) => {

        if (!productId) {
          return;
        }

        try {

          if (showLoader) {
            setLoading(true);
          }

          const response =
            await Axios({
              ...SummaryApi.getProductDetails,

              data: {
                productId:
                  String(productId),
              },
            });

          const responseData =
            response?.data;


          if (
            responseData?.success &&
            responseData?.data
          ) {

            const product =
              responseData.data;


            // =================================================
            // DATE VALUES
            // =================================================

            const manufacturingDate =
              getManufacturingDate(
                product
              );

            const expiryDate =
              getExpiryDate(
                product
              );


            // =================================================
            // DEBUG
            // =================================================

            console.log(
              "========== PRODUCT DATA =========="
            );

            console.log(
              "PRODUCT:",
              product
            );

            console.log(
              "MANUFACTURING DATE:",
              manufacturingDate
            );

            console.log(
              "EXPIRY DATE:",
              expiryDate
            );

            console.log(
              "FORMATTED MANUFACTURING:",
              formatDate(
                manufacturingDate
              )
            );

            console.log(
              "FORMATTED EXPIRY:",
              formatDate(
                expiryDate
              )
            );


            // =================================================
            // SET DATA
            // =================================================

            setData({

              ...product,

              id:
                product?.id ||
                product?._id ||
                productId,

              image:
                Array.isArray(
                  product?.image
                )
                  ? product.image
                  : [],

              price:
                Number(
                  product?.price || 0
                ),

              discount:
                Number(
                  product?.discount || 0
                ),

              stock:
                getSafeStock(
                  product?.stock
                ),

              manufacturingDate,

              expiryDate,

              more_details:
                product?.more_details &&
                typeof product.more_details ===
                  "object"
                  ? product.more_details
                  : {},
            });


            // =================================================
            // IMAGE INDEX
            // =================================================

            setImage(
              (currentImage) => {

                const imageLength =
                  Array.isArray(
                    product?.image
                  )
                    ? product.image.length
                    : 0;

                if (
                  imageLength === 0
                ) {
                  return 0;
                }

                return Math.min(
                  currentImage,
                  imageLength - 1
                );
              }
            );

          }

        } catch (error) {

          console.error(
            "GET PRODUCT ERROR:",
            error?.response?.data ||
              error?.message ||
              error
          );

          AxiosToastError(error);

        } finally {

          if (showLoader) {
            setLoading(false);
          }

        }

      },
      [productId]
    );


  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {

    if (!productId) {
      setLoading(false);
      return;
    }

    fetchProductDetails({
      showLoader: true,
    });

  }, [
    productId,
    fetchProductDetails,
  ]);


  // =========================================================
  // REAL TIME STOCK
  // =========================================================

  useEffect(() => {

    if (!productId) {
      return;
    }

    let intervalId = null;


    const refreshStock = async () => {

      try {

        setStockLoading(true);

        const response =
          await Axios({
            ...SummaryApi.getProductDetails,

            data: {
              productId:
                String(productId),
            },
          });

        const responseData =
          response?.data;


        if (
          responseData?.success &&
          responseData?.data
        ) {

          const latestProduct =
            responseData.data;

          const latestStock =
            getSafeStock(
              latestProduct?.stock
            );


          setData(
            (previous) => ({
              ...previous,

              stock:
                latestStock,
            })
          );

        }

      } catch (error) {

        console.error(
          "REAL-TIME STOCK ERROR:",
          error?.response?.data ||
            error?.message ||
            error
        );

      } finally {

        setStockLoading(false);

      }

    };


    intervalId =
      setInterval(
        refreshStock,
        10000
      );


    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshStock();
        }

      };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {

      if (intervalId) {
        clearInterval(
          intervalId
        );
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

    };

  }, [productId]);


  // =========================================================
  // IMAGE SCROLL
  // =========================================================

  const handleScrollRight = () => {

    if (!imageContainer.current) {
      return;
    }

    imageContainer.current.scrollLeft +=
      100;
  };


  const handleScrollLeft = () => {

    if (!imageContainer.current) {
      return;
    }

    imageContainer.current.scrollLeft -=
      100;
  };


  // =========================================================
  // STOCK
  // =========================================================

  const currentStock =
    getSafeStock(
      data?.stock
    );

  const isOutOfStock =
    currentStock <= 0;

  const isLowStock =
    currentStock > 0 &&
    currentStock <= 5;


  // =========================================================
  // EXPIRY
  // =========================================================

  const productExpired =
    isProductExpired();


  // =========================================================
  // DATE AVAILABLE
  // =========================================================

  const hasManufacturingDate =
    Boolean(
      data?.manufacturingDate
    );

  const hasExpiryDate =
    Boolean(
      data?.expiryDate
    );


  // =========================================================
  // DEBUG
  // =========================================================

  console.log(
    "FINAL MANUFACTURING DATE:",
    data?.manufacturingDate
  );

  console.log(
    "FINAL EXPIRY DATE:",
    data?.expiryDate
  );


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <section className="container mx-auto max-w-7xl p-4 lg:py-8">

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="h-64 sm:h-96 lg:h-[500px] bg-neutral-100 rounded-2xl animate-pulse" />

          <div className="h-[500px] bg-neutral-100 rounded-2xl animate-pulse" />

        </div>

      </section>

    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <section className="container mx-auto max-w-7xl p-4 lg:py-8 grid lg:grid-cols-2 gap-8 items-start">


      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="w-full space-y-4 lg:sticky lg:top-4">


        {/* MAIN IMAGE */}

        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm h-64 sm:h-96 lg:h-[500px] w-full p-4 flex items-center justify-center relative overflow-hidden">

          {data?.image?.length > 0 ? (

            <img
              src={getImageUrl(
                data.image[image]
              )}
              alt={
                data?.name ||
                "Product"
              }
              className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300"
            />

          ) : (

            <div className="text-sm text-neutral-400">
              No image available
            </div>

          )}

        </div>


        {/* DOTS */}

        <div className="flex items-center justify-center gap-1.5">

          {data?.image?.map(
            (_, index) => (

              <div
                key={
                  index + "point"
                }
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === image
                    ? "w-5 bg-neutral-800"
                    : "w-1.5 bg-neutral-200"
                }`}
              />

            )
          )}

        </div>


        {/* THUMBNAILS */}

        <div className="grid relative items-center px-1">

          <div
            ref={imageContainer}
            className="flex gap-3 w-full overflow-x-auto scrollbar-none py-1 scroll-smooth"
          >

            {data?.image?.map(
              (img, index) => {

                const isSelected =
                  index === image;

                return (

                  <div
                    key={
                      img + index
                    }
                    onClick={() =>
                      setImage(index)
                    }
                    className={`w-16 h-16 min-w-16 bg-white p-1 flex items-center justify-center border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "border-neutral-900 ring-1 ring-neutral-900 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >

                    <img
                      src={getImageUrl(
                        img
                      )}
                      alt="thumb"
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />

                  </div>

                );

              }
            )}

          </div>


          {data?.image?.length > 4 && (

            <div className="w-full hidden lg:flex justify-between absolute pointer-events-none px-1">

              <button
                type="button"
                onClick={
                  handleScrollLeft
                }
                className="pointer-events-auto bg-white p-2 rounded-full shadow-md border border-neutral-100 hover:bg-neutral-50 transition-all -ml-3 active:scale-95"
              >
                <FaAngleLeft
                  size={14}
                  className="text-neutral-600"
                />
              </button>


              <button
                type="button"
                onClick={
                  handleScrollRight
                }
                className="pointer-events-auto bg-white p-2 rounded-full shadow-md border border-neutral-100 hover:bg-neutral-50 transition-all -mr-3 active:scale-95"
              >
                <FaAngleRight
                  size={14}
                  className="text-neutral-600"
                />
              </button>

            </div>

          )}

        </div>


        {/* =====================================================
            DESKTOP DESCRIPTION
        ===================================================== */}

        <div className="hidden lg:block bg-white border border-neutral-100 rounded-2xl p-5 space-y-4 shadow-sm mt-6">


          {data.description && (

            <div className="space-y-1">

              <p className="font-bold text-neutral-800 text-sm">
                Description
              </p>

              <p className="text-neutral-600 text-sm leading-relaxed">
                {data.description}
              </p>

            </div>

          )}


          {data.unit && (

            <div className="space-y-0.5 border-t border-neutral-50 pt-3">

              <p className="font-bold text-neutral-800 text-sm">
                Unit
              </p>

              <p className="text-neutral-600 text-sm">
                {data.unit}
              </p>

            </div>

          )}


          {/* MANUFACTURING DATE */}

          {hasManufacturingDate && (

            <div className="space-y-1 border-t border-neutral-50 pt-3">

              <p className="font-bold text-neutral-800 text-sm">
                Manufacturing Date
              </p>

              <p className="text-neutral-700 text-sm font-semibold">
                {formatDate(
                  data.manufacturingDate
                )}
              </p>

            </div>

          )}


          {/* EXPIRY DATE */}

          {hasExpiryDate && (

            <div className="space-y-1 border-t border-neutral-50 pt-3">

              <p className="font-bold text-neutral-800 text-sm">
                Expiry Date
              </p>

              <p
                className={`font-bold text-sm ${
                  productExpired
                    ? "text-red-700"
                    : "text-red-600"
                }`}
              >

                {formatDate(
                  data.expiryDate
                )}

                {productExpired && (
                  <span className="ml-2">
                    (Expired)
                  </span>
                )}

              </p>

            </div>

          )}


          {/* MORE DETAILS */}

          {data?.more_details &&
            Object.keys(
              data.more_details
            ).map(
              (
                element,
                index
              ) => (

                <div
                  key={
                    element +
                    index
                  }
                  className="space-y-1 border-t border-neutral-50 pt-3"
                >

                  <p className="font-semibold text-neutral-800 text-sm">
                    {element}
                  </p>

                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {
                      data
                        .more_details[
                        element
                      ]
                    }
                  </p>

                </div>

              )
            )}

        </div>

      </div>


      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="w-full bg-white border border-neutral-100 rounded-2xl p-5 lg:p-7 shadow-sm space-y-5">


        {/* PRODUCT NAME */}

        <div>

          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide mb-3">
            ⚡ 10 Mins Delivery
          </span>


          <h1 className="text-xl font-extrabold text-neutral-900 lg:text-3xl tracking-tight leading-tight">
            {data.name}
          </h1>


          <p className="text-sm text-neutral-400 font-medium mt-1">
            {data.unit}
          </p>

        </div>


        <Divider />


        {/* STOCK */}

        <div className="flex items-center justify-between gap-3">

          <div>

            <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
              Availability
            </p>


            <div className="mt-1">

              {isOutOfStock ? (

                <p className="text-red-600 font-extrabold text-sm">
                  Out of Stock
                </p>

              ) : isLowStock ? (

                <p className="text-orange-600 font-extrabold text-sm">
                  Only {currentStock}{" "}
                  {currentStock === 1
                    ? "item"
                    : "items"}{" "}
                  left
                </p>

              ) : (

                <p className="text-emerald-600 font-extrabold text-sm">
                  In Stock
                </p>

              )}

            </div>

          </div>


          {!isOutOfStock && (

            <div className="text-right">

              <p className="text-xs text-neutral-400 font-medium">
                Available
              </p>

              <p className="text-lg font-extrabold text-neutral-900">
                {currentStock}
              </p>

            </div>

          )}

        </div>


        {/* STOCK REFRESH */}

        <div className="flex items-center gap-2 text-[11px] text-neutral-400">

          <span
            className={`w-1.5 h-1.5 rounded-full ${
              stockLoading
                ? "bg-orange-400 animate-pulse"
                : "bg-emerald-500"
            }`}
          />

          <span>
            {stockLoading
              ? "Updating stock..."
              : "Stock updated live"}
          </span>

        </div>


        <Divider />


        {/* =====================================================
            DATE INFO
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* MANUFACTURING */}

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

            <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">
              Manufacturing Date
            </p>

            <p className="text-sm font-bold text-neutral-900 mt-1">

              {hasManufacturingDate
                ? formatDate(
                    data.manufacturingDate
                  )
                : "Not available"}

            </p>

          </div>


          {/* EXPIRY */}

          <div className="rounded-xl bg-red-50 border border-red-200 p-4">

            <p className="text-[10px] uppercase tracking-wider font-bold text-red-500">
              Expiry Date
            </p>

            <p className="text-sm font-bold text-red-700 mt-1">

              {hasExpiryDate
                ? formatDate(
                    data.expiryDate
                  )
                : "Not available"}

            </p>


            {productExpired && (

              <p className="text-[10px] font-bold text-red-700 mt-1">
                ⚠ Product Expired
              </p>

            )}

          </div>

        </div>


        <Divider />


        {/* PRICE */}

        <div className="space-y-1.5">

          <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
            Best Price
          </p>


          <div className="flex items-baseline gap-3 flex-wrap">

            <div className="bg-neutral-900 text-white px-3.5 py-1.5 rounded-xl shadow-sm">

              <p className="font-extrabold text-lg lg:text-xl tracking-tight">

                {DisplayPriceInRupees(
                  pricewithDiscount(
                    data.price,
                    data.discount
                  )
                )}

              </p>

            </div>


            {data.discount > 0 && (

              <p className="line-through text-neutral-400 text-sm font-medium">

                {DisplayPriceInRupees(
                  data.price
                )}

              </p>

            )}


            {data.discount > 0 && (

              <span className="font-extrabold text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">

                {data.discount}% OFF

              </span>

            )}

          </div>

        </div>


        {/* ADD TO CART */}

        <div className="pt-2">

          {isOutOfStock ? (

            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl w-fit">
              Out of Stock
            </div>

          ) : productExpired ? (

            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl w-fit">
              Product Expired
            </div>

          ) : (

            <div className="w-full max-w-[180px]">

              <AddToCartButton
                data={data}
              />

            </div>

          )}

        </div>


        {/* WHY SHOP */}

        <div className="border-t border-neutral-100 pt-5 space-y-4">

          <h3 className="font-bold text-neutral-800 text-sm tracking-tight">
            Why shop from NeoBasket?
          </h3>


          <div className="space-y-3.5">


            <div className="flex items-start gap-3.5">

              <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2 shrink-0 shadow-sm">

                <img
                  src={image1}
                  alt="superfast delivery"
                  className="max-w-full max-h-full object-contain"
                />

              </div>


              <div>

                <h4 className="font-bold text-neutral-800 text-xs sm:text-sm">
                  Superfast Delivery
                </h4>

                <p className="text-neutral-500 text-xs leading-relaxed">
                  Get your order delivered to your doorstep at the earliest from dark stores near you.
                </p>

              </div>

            </div>


            <div className="flex items-start gap-3.5">

              <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2 shrink-0 shadow-sm">

                <img
                  src={image2}
                  alt="Best prices offers"
                  className="max-w-full max-h-full object-contain"
                />

              </div>


              <div>

                <h4 className="font-bold text-neutral-800 text-xs sm:text-sm">
                  Best Prices & Offers
                </h4>

                <p className="text-neutral-500 text-xs leading-relaxed">
                  Best price destination with offers directly from the manufacturers.
                </p>

              </div>

            </div>


            <div className="flex items-start gap-3.5">

              <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2 shrink-0 shadow-sm">

                <img
                  src={image3}
                  alt="Wide Assortment"
                  className="max-w-full max-h-full object-contain"
                />

              </div>


              <div>

                <h4 className="font-bold text-neutral-800 text-xs sm:text-sm">
                  Wide Assortment
                </h4>

                <p className="text-neutral-500 text-xs leading-relaxed">
                  Choose from 5000+ products across food, personal care, household & other categories.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* MOBILE DESCRIPTION */}

        <div className="lg:hidden bg-neutral-50 rounded-xl p-4 space-y-3.5 !mt-6">

          {data.description && (

            <div>

              <p className="font-bold text-neutral-800 text-xs uppercase">
                Description
              </p>

              <p className="text-neutral-600 text-sm leading-relaxed">
                {data.description}
              </p>

            </div>

          )}


          {data.unit && (

            <div className="border-t border-neutral-200/50 pt-2.5">

              <p className="font-bold text-neutral-800 text-xs uppercase">
                Lot Number
              </p>

              <p className="text-neutral-600 text-sm">
                {data.unit}
              </p>

            </div>

          )}


          {/* MOBILE MANUFACTURING */}

          <div className="border-t border-neutral-200/50 pt-2.5">

            <p className="font-bold text-neutral-800 text-xs uppercase">
              Manufacturing Date
            </p>

            <p className="text-neutral-700 text-sm font-semibold">

              {hasManufacturingDate
                ? formatDate(
                    data.manufacturingDate
                  )
                : "Not available"}

            </p>

          </div>


          {/* MOBILE EXPIRY */}

          <div className="border-t border-neutral-200/50 pt-2.5">

            <p className="font-bold text-neutral-800 text-xs uppercase">
              Expiry Date
            </p>

            <p className="text-red-600 text-sm font-semibold">

              {hasExpiryDate
                ? formatDate(
                    data.expiryDate
                  )
                : "Not available"}

              {productExpired && (
                <span className="ml-2">
                  (Expired)
                </span>
              )}

            </p>

          </div>


          {/* MORE DETAILS */}

          {data?.more_details &&
            Object.keys(
              data.more_details
            ).map(
              (
                element,
                index
              ) => (

                <div
                  key={
                    element +
                    index
                  }
                  className="border-t border-neutral-200/50 pt-2.5"
                >

                  <p className="font-bold text-neutral-800 text-xs uppercase">
                    {element}
                  </p>

                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {
                      data
                        ?.more_details[
                        element
                      ]
                    }
                  </p>

                </div>

              )
            )}

        </div>

      </div>

    </section>

  );
};


export default ProductDisplayPage;