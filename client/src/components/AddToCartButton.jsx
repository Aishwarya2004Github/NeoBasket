import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useGlobalContext } from "../provider/GlobalProvider";

const AddToCartButton = ({ data }) => {
  const {
    fetchCartItem,
    updateCartItem,
    deleteCartItem,
  } = useGlobalContext();

  // =====================================================
  // REDUX CART
  // =====================================================

  const reduxCart = useSelector(
    (state) => state.cartItem.cart || []
  );

  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // NORMALIZE ID
  // =====================================================
  // Important:
  // Every product must have ONE unique ID.
  // Supports both MongoDB _id and normal id.
  // =====================================================

  const getId = (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    return String(value);
  };

  // Current product ID
  const productId = getId(
    data?.id ?? data?._id
  );

  // =====================================================
  // GET PRODUCT ID FROM CART ITEM
  // =====================================================

  const getCartProductId = (cartItem) => {
    if (!cartItem) return null;

    const product = cartItem.product;

    // If product is an object
    if (product && typeof product === "object") {
      return getId(
        product.id ?? product._id
      );
    }

    // If backend stores product directly as ID
    if (
      typeof product === "string" ||
      typeof product === "number"
    ) {
      return getId(product);
    }

    // Some APIs may return productId
    return getId(
      cartItem.productId ??
      cartItem.product_id
    );
  };

  // =====================================================
  // FIND CURRENT PRODUCT CART ITEM
  // =====================================================

  useEffect(() => {
    if (!productId) {
      setCartItemDetails(null);
      setQty(0);
      return;
    }

    const item = reduxCart.find((cartItem) => {
      const cartProductId =
        getCartProductId(cartItem);

      return (
        cartProductId !== null &&
        cartProductId === productId
      );
    });

    setCartItemDetails(item || null);
    setQty(
      item
        ? Number(item.quantity || 0)
        : 0
    );
  }, [reduxCart, productId]);

  // =====================================================
  // CHECK CURRENT PRODUCT IN CART
  // =====================================================

  const isInCart =
    !!cartItemDetails &&
    qty > 0;

  // =====================================================
  // STOCK
  // =====================================================

  const stock = Number(
    data?.stock ?? 0
  );

  const isOutOfStock = stock <= 0;

  // =====================================================
  // CART ITEM ID
  // =====================================================

  const getCartItemId = () => {
    if (!cartItemDetails) {
      return null;
    }

    return (
      cartItemDetails.id ??
      cartItemDetails._id
    );
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addTocart,

        data: {
          productId: productId,
          qty: 1,
        },
      });

      if (response?.data?.success) {
        toast.success(
          response.data.message ||
            "Product added to cart"
        );

        await fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemDetails) {
      return;
    }

    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    if (isOutOfStock) {
      toast.error(
        "This product is out of stock"
      );
      return;
    }

    const currentQty = Number(qty || 0);
    const newQty = currentQty + 1;

    // Stock protection
    if (newQty > stock) {
      toast.error(
        `Only ${stock} unit${
          stock > 1 ? "s" : ""
        } available`
      );
      return;
    }

    const cartItemId =
      getCartItemId();

    if (!cartItemId) {
      toast.error(
        "Cart item ID not found"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await updateCartItem(
        cartItemId,
        newQty
      );

      if (res?.success) {
        toast.success(
          "Quantity Increased"
        );

        await fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemDetails) {
      return;
    }

    const currentQty = Number(qty || 0);

    const cartItemId =
      getCartItemId();

    if (!cartItemId) {
      toast.error(
        "Cart item ID not found"
      );
      return;
    }

    try {
      setLoading(true);

      // If quantity is 1, remove product
      if (currentQty <= 1) {
        const res =
          await deleteCartItem(
            cartItemId
          );

        if (res?.success !== false) {
          await fetchCartItem();
        }

        return;
      }

      const newQty =
        currentQty - 1;

      const res =
        await updateCartItem(
          cartItemId,
          newQty
        );

      if (res?.success) {
        toast.success(
          "Quantity Decreased"
        );

        await fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="w-[120px] font-black tracking-wide text-xs"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* =================================================
          OUT OF STOCK
      ================================================= */}

      {isOutOfStock ? (
        <div
          className="
            w-full
            py-2
            rounded-xl
            text-center
            uppercase
            tracking-widest
            font-black
            text-xs
            bg-slate-800
            text-red-400
            border
            border-red-500/30
            cursor-not-allowed
          "
        >
          Out of Stock
        </div>
      ) : isInCart ? (
        /* =================================================
           QUANTITY CONTROLLER
        ================================================= */

        <div
          className="
            flex
            items-center
            bg-slate-950/80
            border
            border-slate-800/80
            rounded-xl
            overflow-hidden
            shadow-[0_0_15px_rgba(34,211,238,0.05)]
          "
        >
          {/* MINUS */}

          <button
            type="button"
            onClick={decreaseQty}
            disabled={loading}
            className="
              bg-slate-900
              border-r
              border-slate-800/60
              text-pink-500
              hover:text-pink-400
              hover:bg-slate-800/60
              flex-1
              py-2.5
              flex
              justify-center
              items-center
              transition-all
              duration-200
              active:scale-90
              disabled:opacity-50
            "
          >
            <FaMinus size={11} />
          </button>

          {/* QUANTITY */}

          <div
            className="
              flex-1
              text-center
              text-slate-200
              text-sm
              font-black
              select-none
            "
          >
            {qty}
          </div>

          {/* PLUS */}

          <button
            type="button"
            onClick={increaseQty}
            disabled={
              loading ||
              qty >= stock
            }
            className="
              bg-slate-900
              border-l
              border-slate-800/60
              text-cyan-400
              hover:text-cyan-300
              hover:bg-slate-800/60
              flex-1
              py-2.5
              flex
              justify-center
              items-center
              transition-all
              duration-200
              active:scale-90
              disabled:opacity-30
              disabled:cursor-not-allowed
            "
          >
            <FaPlus size={11} />
          </button>
        </div>
      ) : (
        /* =================================================
           ADD BUTTON
        ================================================= */

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading}
          className={`
            w-full
            py-2
            rounded-xl
            text-center
            uppercase
            tracking-widest
            font-black
            text-xs
            transition-all
            duration-300
            shadow-md

            ${
              loading
                ? `
                  bg-slate-800
                  text-slate-500
                  cursor-not-allowed
                  border
                  border-slate-700/40
                  animate-pulse
                `
                : `
                  bg-gradient-to-r
                  from-pink-500
                  to-rose-600
                  text-white
                  shadow-[0_3px_10px_rgba(244,63,94,0.25)]
                  hover:shadow-[0_4px_18px_rgba(244,63,94,0.45)]
                  hover:brightness-110
                  active:scale-95
                `
            }
          `}
        >
          {loading ? "..." : "Add"}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;