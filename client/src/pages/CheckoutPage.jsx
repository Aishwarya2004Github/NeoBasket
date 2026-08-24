import React, { useState } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import AddAddress from "../components/AddAddress";
import { useSelector } from "react-redux";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const CheckoutPage = () => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    fetchCartItem,
    fetchOrder,
  } = useGlobalContext();

  const [openAddress, setOpenAddress] = useState(false);

  // Prevent COD / online payment double click
  const [isProcessing, setIsProcessing] = useState(false);

  const addressList = useSelector(
    (state) => state.addresses?.addressList || []
  );

  const cartItemsList = useSelector(
    (state) => state.cartItem?.cart || []
  );

  const user = useSelector((state) => state.user);

  const [selectAddress, setSelectAddress] = useState(0);

  const navigate = useNavigate();

  /* ============================================================
     GET SELECTED ADDRESS
  ============================================================ */

  const getSelectedAddress = () => {
    const address = addressList?.[selectAddress];

    if (!address?.id) {
      toast.error("Please select an address");
      return null;
    }

    if (!address.status) {
      toast.error("Please select an active address");
      return null;
    }

    return address;
  };

  /* ============================================================
     CHECK CART
  ============================================================ */

  const validateCart = () => {
    // Empty cart
    if (!cartItemsList || cartItemsList.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    /* ==========================================================
       STOCK VALIDATION
    ========================================================== */

    for (const item of cartItemsList) {
      const product = item?.product || item;

      const productName =
        product?.name ||
        product?.productName ||
        "Product";

      const quantity = Number(item?.quantity || 0);

      /*
       * Support different possible stock field names.
       *
       * Prefer `stock`.
       */
      const stock = Number(
        product?.stock ??
          product?.stockQuantity ??
          product?.availableStock ??
          0
      );

      /* --------------------------------------------------------
         OUT OF STOCK
      -------------------------------------------------------- */

      if (stock <= 0) {
        toast.error(`${productName} is out of stock`);
        return false;
      }

      /* --------------------------------------------------------
         CART QUANTITY > AVAILABLE STOCK
      -------------------------------------------------------- */

      if (quantity > stock) {
        toast.error(
          `${productName} has only ${stock} item${
            stock > 1 ? "s" : ""
          } available`
        );

        return false;
      }
    }

    return true;
  };

  /* ============================================================
     CASH ON DELIVERY
  ============================================================ */

  const handleCashOnDelivery = async () => {
    // Stop multiple clicks / duplicate order requests
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      /* --------------------------------------------------------
         VALIDATE CART + STOCK
      -------------------------------------------------------- */

      if (!validateCart()) {
        setIsProcessing(false);
        return;
      }

      /* --------------------------------------------------------
         VALIDATE ADDRESS
      -------------------------------------------------------- */

      const selectedAddress = getSelectedAddress();

      if (!selectedAddress) {
        setIsProcessing(false);
        return;
      }

      /*
       * IMPORTANT:
       * Backend should generate a UNIQUE orderId.
       *
       * We send actual cart items so each item's quantity
       * remains independent.
       */

      const orderData = {
        list_items: cartItemsList,
        addressId: selectedAddress.id,
        subTotalAmt: Number(totalPrice) || 0,
        totalAmt: Number(totalPrice) || 0,
      };

      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: orderData,
      });

      const responseData = response?.data;

      /* --------------------------------------------------------
         BACKEND RESPONSE
      -------------------------------------------------------- */

      if (!responseData?.success) {
        toast.error(
          responseData?.message ||
            "Unable to place Cash on Delivery order"
        );

        setIsProcessing(false);
        return;
      }

      toast.success(
        responseData?.message ||
          "Order placed successfully"
      );

      /* --------------------------------------------------------
         REFRESH CART + ORDERS
      -------------------------------------------------------- */

      if (fetchCartItem) {
        await fetchCartItem();
      }

      if (fetchOrder) {
        await fetchOrder();
      }

      /* --------------------------------------------------------
         SUCCESS PAGE
      -------------------------------------------------------- */

      navigate("/success", {
        state: {
          text: "Order",
        },
      });
    } catch (error) {
      console.error(
        "Cash On Delivery Error:",
        error?.response?.data || error
      );

      AxiosToastError(error);

      setIsProcessing(false);
    }
  };

  /* ============================================================
     ONLINE PAYMENT
  ============================================================ */

  const handleOnlinePayment = async () => {
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      /* --------------------------------------------------------
         VALIDATE CART + STOCK
      -------------------------------------------------------- */

      if (!validateCart()) {
        setIsProcessing(false);
        return;
      }

      /* --------------------------------------------------------
         VALIDATE ADDRESS
      -------------------------------------------------------- */

      const selectedAddress = getSelectedAddress();

      if (!selectedAddress) {
        setIsProcessing(false);
        return;
      }

      /* --------------------------------------------------------
         STRIPE KEY
      -------------------------------------------------------- */

      const stripePublicKey =
        import.meta.env.VITE_STRIPE_PUBLIC_KEY;

      if (!stripePublicKey) {
        toast.error(
          "Stripe public key is missing"
        );

        setIsProcessing(false);
        return;
      }

      /* --------------------------------------------------------
         LOADING
      -------------------------------------------------------- */

      toast.loading(
        "Redirecting to payment gateway...",
        {
          id: "stripe-payment",
        }
      );

      /* --------------------------------------------------------
         LOAD STRIPE
      -------------------------------------------------------- */

      const stripe = await loadStripe(
        stripePublicKey
      );

      if (!stripe) {
        toast.error(
          "Unable to initialize payment gateway",
          {
            id: "stripe-payment",
          }
        );

        setIsProcessing(false);
        return;
      }

      /* --------------------------------------------------------
         CREATE PAYMENT SESSION
      -------------------------------------------------------- */

      const response = await Axios({
        ...SummaryApi.payment_url,

        data: {
          list_items: cartItemsList,
          addressId: selectedAddress.id,
          subTotalAmt: Number(totalPrice) || 0,
          totalAmt: Number(totalPrice) || 0,
        },
      });

      const responseData = response?.data;

      /* --------------------------------------------------------
         PAYMENT RESPONSE
      -------------------------------------------------------- */

      if (
        !responseData?.success &&
        !responseData?.id
      ) {
        toast.error(
          responseData?.message ||
            "Unable to create payment session",
          {
            id: "stripe-payment",
          }
        );

        setIsProcessing(false);
        return;
      }

      toast.dismiss("stripe-payment");

      /* --------------------------------------------------------
         REDIRECT TO STRIPE
      -------------------------------------------------------- */

      if (responseData?.id) {
        const result =
          await stripe.redirectToCheckout({
            sessionId: responseData.id,
          });

        if (result?.error) {
          toast.error(
            result.error.message ||
              "Unable to redirect to payment"
          );

          setIsProcessing(false);
        }

        return;
      }

      toast.error(
        "Payment session ID is missing"
      );

      setIsProcessing(false);
    } catch (error) {
      console.error(
        "Online Payment Error:",
        error?.response?.data || error
      );

      toast.dismiss("stripe-payment");

      AxiosToastError(error);

      setIsProcessing(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="bg-neutral-50/50 min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-6 items-start">

        {/* ========================================================
            LEFT SIDE - ADDRESS
        ======================================================== */}

        <div className="w-full lg:flex-1 bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">

          <h3 className="text-lg font-bold text-neutral-800 mb-4">
            Delivery Address
          </h3>

          <div className="grid gap-3">

            {addressList.map((address, index) => {
              if (!address.status) {
                return null;
              }

              const isSelected =
                selectAddress === index;

              return (
                <label
                  key={address.id || index}
                  htmlFor={`address${index}`}
                  className="cursor-pointer block select-none"
                >
                  <div
                    className={`border rounded-xl p-4 flex gap-3.5 transition-all relative ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500"
                        : "border-neutral-200 hover:bg-neutral-50 bg-white"
                    }`}
                  >

                    {/* Radio */}

                    <div className="flex items-start mt-0.5">
                      <input
                        id={`address${index}`}
                        type="radio"
                        value={index}
                        checked={isSelected}
                        onChange={(e) =>
                          setSelectAddress(
                            Number(e.target.value)
                          )
                        }
                        name="address"
                        className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500 cursor-pointer mt-0.5"
                      />
                    </div>

                    {/* Address Details */}

                    <div className="text-sm text-neutral-600 space-y-0.5">

                      <p className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                        Address Line #{index + 1}

                        {isSelected && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                            Selected
                          </span>
                        )}
                      </p>

                      <p className="text-neutral-700">
                        {address.address_line}
                      </p>

                      <p className="font-medium text-neutral-600">
                        {address.city},{" "}
                        {address.state}
                      </p>

                      <p className="text-xs text-neutral-400 font-mono">
                        {address.country} -{" "}
                        {address.pincode}
                      </p>

                      <p className="text-neutral-800 font-medium pt-1 text-xs">
                        Mobile: {address.mobile}
                      </p>

                    </div>
                  </div>
                </label>
              );
            })}

            {/* Add Address */}

            <div
              onClick={() =>
                setOpenAddress(true)
              }
              className="h-16 bg-neutral-50 hover:bg-neutral-100 border-2 border-dashed border-neutral-200 hover:border-primary-100 flex justify-center items-center gap-1 rounded-xl cursor-pointer transition-all text-neutral-500 hover:text-primary-200 text-sm font-semibold select-none"
            >
              <span className="text-lg font-light">
                +
              </span>

              Add New Address
            </div>

          </div>
        </div>

        {/* ========================================================
            RIGHT SIDE - ORDER SUMMARY
        ======================================================== */}

        <div className="w-full lg:w-[380px] bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm shrink-0 sticky top-4">

          <h3 className="text-lg font-bold text-neutral-800 mb-4 border-b border-neutral-50 pb-2">
            Order Summary
          </h3>

          {/* Bill */}

          <div className="space-y-3 text-sm text-neutral-600 mb-6">

            {/* Items Total */}

            <div className="flex justify-between items-center">

              <p>Items total</p>

              <p className="flex items-center gap-2 font-medium">

                <span className="line-through text-neutral-400 text-xs">
                  {DisplayPriceInRupees(
                    notDiscountTotalPrice
                  )}
                </span>

                <span className="text-neutral-800">
                  {DisplayPriceInRupees(
                    totalPrice
                  )}
                </span>

              </p>
            </div>

            {/* Quantity */}

            <div className="flex justify-between items-center">

              <p>Quantity total</p>

              <p className="font-semibold text-neutral-800">
                {totalQty}{" "}
                {totalQty > 1
                  ? "items"
                  : "item"}
              </p>

            </div>

            {/* Delivery */}

            <div className="flex justify-between items-center">

              <p>Delivery Charge</p>

              <p className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                FREE
              </p>

            </div>

            <div className="h-[1px] bg-neutral-100 my-2" />

            {/* Grand Total */}

            <div className="flex items-center justify-between gap-4 pt-1">

              <p className="font-bold text-neutral-800 text-base">
                Grand Total
              </p>

              <p className="font-extrabold text-neutral-900 text-lg">
                {DisplayPriceInRupees(
                  totalPrice
                )}
              </p>

            </div>

          </div>

          {/* ======================================================
              BUTTONS
          ====================================================== */}

          <div className="flex flex-col gap-2.5 w-full">

            {/* ONLINE */}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleOnlinePayment}
              className={`w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all text-center ${
                isProcessing
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {isProcessing
                ? "Processing..."
                : "Pay Online (Stripe)"}
            </button>

            {/* COD */}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCashOnDelivery}
              className={`w-full py-2.5 px-4 border border-neutral-200 text-neutral-700 font-bold text-sm bg-white hover:bg-neutral-50 rounded-xl active:scale-[0.99] transition-all text-center ${
                isProcessing
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {isProcessing
                ? "Placing Order..."
                : "Cash on Delivery (COD)"}
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================
          ADD ADDRESS MODAL
      ======================================================== */}

      {openAddress && (
        <AddAddress
          close={() =>
            setOpenAddress(false)
          }
        />
      )}

    </section>
  );
};

export default CheckoutPage;