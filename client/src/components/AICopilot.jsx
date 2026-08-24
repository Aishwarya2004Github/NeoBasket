import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { addToCartProduct } from "../utils/addToCartProduct";
import { useGlobalContext } from "../provider/GlobalProvider";

const AICopilot = () => {
  const user = useSelector((state) => state.user);
  const { fetchCartItem } = useGlobalContext();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    item: null,
  });

  const [cartLoading, setCartLoading] = useState(false);

  // =========================================================
  // HELPERS
  // =========================================================

  const getProductId = (item) => {
    if (!item) return "";

    return String(
      item.productId ??
        item._id ??
        item.id ??
        item.product?._id ??
        item.product?.id ??
        ""
    );
  };

  /**
   * Convert quantity into a valid positive integer.
   *
   * IMPORTANT:
   * This is used only when we actually need a numeric quantity.
   */
  const getQuantity = (quantity) => {
    const parsed = Number(quantity);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }

    return Math.floor(parsed);
  };

  const getPrice = (item) => {
    const price = Number(
      item?.finalPrice ??
        item?.unitPrice ??
        item?.price ??
        0
    );

    return Number.isFinite(price) ? price : 0;
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:8080${image}`;
  };

  // =========================================================
  // NORMALIZE AI RESPONSE
  // =========================================================

  const normalizeResult = (data) => {
    if (!data) {
      return null;
    }

    const rawProducts = Array.isArray(data.products)
      ? data.products
      : Array.isArray(data.basket)
      ? data.basket
      : [];

    const products = rawProducts
      .map((item, index) => {
        const productId = getProductId(item);

        if (!productId) {
          return null;
        }

        /**
         * IMPORTANT
         *
         * Preserve the quantity returned by AI.
         *
         * Example:
         *
         * AI:
         * {
         *   productId: "123",
         *   quantity: 3
         * }
         *
         * Result:
         * {
         *   productId: "123",
         *   quantity: 3
         * }
         */
        const quantity = getQuantity(
          item.quantity
        );

        return {
          ...item,

          productId,

          quantity,

          name:
            item.name ||
            item.productName ||
            "Unknown Product",

          unit:
            item.unit ||
            item.unitName ||
            "item",

          finalPrice: getPrice(item),

          image:
            item.image ||
            item.productImage ||
            (Array.isArray(item.images)
              ? item.images[0]
              : "") ||
            "",

          discount:
            Number(item.discount) || 0,

          __aiKey: `${productId}-${index}`,
        };
      })
      .filter(Boolean);

    return {
      ...data,

      products,

      budget:
        Number(data.budget) ||
        Number(data.constraints?.budget) ||
        0,

      people:
        Number(data.people) ||
        Number(data.constraints?.people) ||
        null,

      days:
        Number(data.days) ||
        Number(data.constraints?.days) ||
        null,

      savings:
        Number(data.savings ?? data.saving) || 0,

      remainingBudget:
        Number(data.remainingBudget) || 0,
    };
  };

  // =========================================================
  // CALCULATED TOTAL
  // =========================================================

  const calculatedTotal = useMemo(() => {
    if (!result?.products?.length) {
      return 0;
    }

    return result.products.reduce(
      (total, item) => {
        const price = getPrice(item);
        const quantity = getQuantity(
          item.quantity
        );

        return total + price * quantity;
      },
      0
    );
  }, [result]);

  // =========================================================
  // REMAINING BUDGET
  // =========================================================

  const calculatedRemainingBudget = useMemo(() => {
    const budget = Number(
      result?.budget || 0
    );

    if (!budget) {
      return 0;
    }

    return Math.max(
      0,
      budget - calculatedTotal
    );
  }, [result, calculatedTotal]);

  // =========================================================
  // GENERATE AI BASKET
  // =========================================================

  const handleGenerate = async () => {
    const userId =
      user?._id || user?.id;

    if (!userId) {
      toast.error(
        "Please login to use AI Shopping Copilot"
      );
      return;
    }

    const cleanMessage =
      message.trim();

    if (!cleanMessage) {
      toast.error(
        "Tell AI what you want to buy"
      );
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const token =
        localStorage.getItem(
          "accesstoken"
        );

      const response = await Axios({
        url:
          SummaryApi.aiShoppingCopilot.url,
        method: "post",

        data: {
          message: cleanMessage,
        },

        headers: {
          Authorization: token
            ? `Bearer ${token}`
            : "",
        },
      });

      const responseData =
        response?.data;

      if (
        responseData?.success === false
      ) {
        toast.error(
          responseData?.message ||
            "AI could not understand your request"
        );

        return;
      }

      const aiData =
        responseData?.data ||
        responseData;

      // =====================================================
      // UNSUPPORTED REQUEST
      // =====================================================

      if (
        aiData?.supported === false ||
        aiData?.isGroceryRequest === false ||
        aiData?.type === "unsupported"
      ) {
        setResult({
          unsupported: true,

          message:
            aiData?.message ||
            "Sorry, I can only help with grocery shopping, baskets, recipes and NeoBasket products.",
        });

        return;
      }

      // =====================================================
      // NORMALIZE
      // =====================================================

      const normalized =
        normalizeResult(aiData);

      if (
        !normalized?.products?.length
      ) {
        setResult({
          unsupported: true,

          message:
            aiData?.message ||
            "I couldn't find suitable grocery products for your request. Try asking for groceries, fruits, vegetables, milk or other household items.",
        });

        return;
      }

      setResult(normalized);

      toast.success(
        "AI basket generated!"
      );
    } catch (error) {
      console.error(
        "AI COPILOT ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "AI service unavailable"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQuantity = (
    productId,
    newQuantity
  ) => {
    const id = String(productId);

    let quantity = Number(
      newQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      quantity = 1;
    }

    quantity = Math.floor(quantity);

    setResult((prev) => {
      if (
        !prev?.products?.length
      ) {
        return prev;
      }

      return {
        ...prev,

        products:
          prev.products.map(
            (item) => {
              if (
                String(
                  item.productId
                ) !== id
              ) {
                return item;
              }

              return {
                ...item,
                quantity,
              };
            }
          ),
      };
    });
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const increaseQuantity = (
    productId
  ) => {
    const item =
      result?.products?.find(
        (product) =>
          String(
            product.productId
          ) ===
          String(productId)
      );

    if (!item) {
      return;
    }

    const currentQuantity =
      getQuantity(item.quantity);

    updateQuantity(
      productId,
      currentQuantity + 1
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const decreaseQuantity = (
    productId
  ) => {
    const item =
      result?.products?.find(
        (product) =>
          String(
            product.productId
          ) ===
          String(productId)
      );

    if (!item) {
      return;
    }

    const currentQuantity =
      getQuantity(item.quantity);

    if (currentQuantity <= 1) {
      return;
    }

    updateQuantity(
      productId,
      currentQuantity - 1
    );
  };

  // =========================================================
  // OPEN SINGLE CONFIRMATION
  // =========================================================

  const askAddToCart = (item) => {
    if (!item) {
      return;
    }

    /**
     * IMPORTANT:
     *
     * Make a snapshot of the CURRENT quantity.
     *
     * If user changes:
     *
     * Banana 1 -> 3
     *
     * the confirmation modal gets:
     *
     * quantity: 3
     */
    const currentItem = {
      ...item,

      productId:
        getProductId(item),

      quantity:
        getQuantity(
          item.quantity
        ),
    };

    console.log(
      "OPEN SINGLE CART CONFIRMATION:",
      {
        productId:
          currentItem.productId,
        quantity:
          currentItem.quantity,
      }
    );

    setConfirmModal({
      open: true,
      type: "single",
      item: currentItem,
    });
  };

  // =========================================================
  // OPEN ALL CONFIRMATION
  // =========================================================

  const askAddEntireBasket =
    () => {
      if (
        !result?.products?.length
      ) {
        return;
      }

      setConfirmModal({
        open: true,
        type: "all",
        item: null,
      });
    };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeConfirmModal =
    () => {
      if (cartLoading) {
        return;
      }

      setConfirmModal({
        open: false,
        type: null,
        item: null,
      });
    };

  // =========================================================
  // ADD SINGLE PRODUCT
  // =========================================================

  const addSingleProduct =
    async (item) => {
      if (!item) {
        return;
      }

      const productId =
        getProductId(item);

      const quantity =
        getQuantity(
          item.quantity
        );

      if (!productId) {
        toast.error(
          "Product ID not found"
        );
        return;
      }

      /**
       * DEBUG
       *
       * If this says:
       *
       * productId: "123"
       * quantity: 3
       *
       * then this component is correctly
       * sending quantity 3.
       */
      console.log(
        "AICOPILOT → ADD SINGLE:",
        {
          productId,
          quantity,
          item,
        }
      );

      try {
        setCartLoading(true);

        /**
         * IMPORTANT:
         *
         * BOTH values are passed.
         */
        const response =
          await addToCartProduct(
            productId,
            quantity
          );

        console.log(
          "AICOPILOT ← CART RESPONSE:",
          response
        );

        if (!response?.success) {
          toast.error(
            response?.message ||
              "Unable to add product to cart"
          );

          return;
        }

        // Refresh actual cart.
        if (
          typeof fetchCartItem ===
          "function"
        ) {
          await fetchCartItem();
        }

        closeConfirmModal();

        toast.success(
          `${
            item?.name ||
            "Product"
          } × ${quantity} added to cart`
        );
      } catch (error) {
        console.error(
          "ADD SINGLE PRODUCT:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to add product to cart"
        );
      } finally {
        setCartLoading(false);
      }
    };

  // =========================================================
  // ADD COMPLETE AI BASKET
  // =========================================================

  const addEntireBasket =
    async () => {
      const products =
        result?.products || [];

      if (!products.length) {
        return;
      }

      try {
        setCartLoading(true);

        let added = 0;
        let failed = 0;

        /**
         * IMPORTANT:
         *
         * Every product uses its own quantity.
         *
         * Example:
         *
         * Banana = 3
         * Milk   = 2
         * Rice   = 1
         */
        for (const item of products) {
          const productId =
            getProductId(item);

          const quantity =
            getQuantity(
              item.quantity
            );

          if (!productId) {
            failed++;
            continue;
          }

          console.log(
            "AICOPILOT → ADD BASKET ITEM:",
            {
              name: item.name,
              productId,
              quantity,
            }
          );

          try {
            const response =
              await addToCartProduct(
                productId,
                quantity
              );

            console.log(
              "AICOPILOT ← ITEM RESPONSE:",
              {
                productId,
                quantity,
                response,
              }
            );

            if (
              response?.success
            ) {
              added++;
            } else {
              failed++;

              console.error(
                `Failed to add ${item.name}:`,
                response?.message
              );
            }
          } catch (error) {
            failed++;

            console.error(
              `Failed to add ${item.name}:`,
              error
            );
          }
        }

        // Refresh cart once.
        if (
          typeof fetchCartItem ===
          "function"
        ) {
          await fetchCartItem();
        }

        closeConfirmModal();

        if (added > 0) {
          toast.success(
            `${added} product${
              added > 1
                ? "s"
                : ""
            } added to your cart`
          );
        }

        if (failed > 0) {
          toast.error(
            `${failed} product${
              failed > 1
                ? "s"
                : ""
            } could not be added`
          );
        }
      } catch (error) {
        console.error(
          "ADD AI BASKET:",
          error
        );

        toast.error(
          "Unable to add AI basket to cart"
        );
      } finally {
        setCartLoading(false);
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <section className="container mx-auto px-4 mt-8">
        <div
          className="
            rounded-3xl
            p-6
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-purple-950
            border
            border-purple-500/20
            shadow-[0_0_40px_rgba(139,92,246,0.12)]
          "
        >
          {/* HEADER */}

          <div className="flex items-center gap-3 mb-5">
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-gradient-to-br
                from-purple-500
                to-cyan-500
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              🤖
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                AI Shopping Copilot
              </h2>

              <p className="text-sm text-slate-400">
                Tell me what you need. I'll
                prepare your grocery basket.
              </p>
            </div>
          </div>

          {/* INPUT */}

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey ||
                  e.metaKey)
              ) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={`Example:
I need groceries for 4 people
for 3 days under ₹1500`}
            className="
              w-full
              min-h-[110px]
              resize-none
              rounded-2xl
              bg-slate-950
              border
              border-slate-800
              p-4
              text-white
              outline-none
              focus:border-purple-500
            "
          />

          {/* GENERATE */}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="
              mt-4
              w-full
              rounded-2xl
              py-3
              font-black
              text-white
              bg-gradient-to-r
              from-purple-600
              to-cyan-600
              hover:brightness-110
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading
              ? "🤖 AI is preparing your basket..."
              : "✨ Create AI Basket"}
          </button>

          {/* UNSUPPORTED */}

          {result?.unsupported && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-amber-500/30
                bg-amber-500/10
                p-5
              "
            >
              <div className="text-3xl mb-2">
                🤖
              </div>

              <h3 className="text-lg font-black text-white">
                I'm your Grocery AI Assistant
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {result.message}
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Try: "Milk for 3 days",
                "groceries under ₹1000",
                "healthy breakfast ingredients",
                etc.
              </p>
            </div>
          )}

          {/* RESULT */}

          {result &&
            !result.unsupported &&
            result.products?.length >
              0 && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  bg-slate-950/70
                  border
                  border-slate-800
                  p-5
                "
              >
                {/* RESULT HEADER */}

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    justify-between
                    sm:items-center
                    gap-4
                    mb-5
                  "
                >
                  <div>
                    <h3 className="text-lg font-black text-white">
                      🛒 AI Recommended Basket
                    </h3>

                    <p className="text-xs text-slate-500">
                      Budget ₹
                      {result.budget ||
                        0}

                      {result.people
                        ? ` • ${result.people} people`
                        : ""}

                      {result.days
                        ? ` • ${result.days} days`
                        : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Current Total
                    </p>

                    <p className="text-xl font-black text-emerald-400">
                      ₹
                      {calculatedTotal.toFixed(
                        0
                      )}
                    </p>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="space-y-3">
                  {result.products.map(
                    (item) => {
                      const quantity =
                        getQuantity(
                          item.quantity
                        );

                      const price =
                        getPrice(item);

                      const subtotal =
                        price *
                        quantity;

                      return (
                        <div
                          key={
                            item.__aiKey ||
                            item.productId
                          }
                          className="
                            rounded-2xl
                            bg-slate-900
                            border
                            border-slate-800
                            p-3
                          "
                        >
                          {/* PRODUCT */}

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                min-w-0
                              "
                            >
                              {/* IMAGE */}

                              {item.image ? (
                                <img
                                  src={getImageUrl(
                                    item.image
                                  )}
                                  className="
                                    w-14
                                    h-14
                                    object-contain
                                    rounded-xl
                                    bg-white
                                    shrink-0
                                  "
                                  alt={
                                    item.name
                                  }
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <div
                                  className="
                                    w-14
                                    h-14
                                    rounded-xl
                                    bg-slate-800
                                    flex
                                    items-center
                                    justify-center
                                    text-2xl
                                    shrink-0
                                  "
                                >
                                  🛒
                                </div>
                              )}

                              {/* NAME */}

                              <div className="min-w-0">
                                <p
                                  className="
                                    text-sm
                                    font-bold
                                    text-white
                                  "
                                >
                                  {item.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {item.unit ||
                                    "item"}
                                </p>

                                <p className="text-xs text-emerald-400 mt-1">
                                  ₹
                                  {price.toFixed(
                                    0
                                  )}{" "}
                                  / unit
                                </p>
                              </div>
                            </div>

                            {/* SUBTOTAL */}

                            <div className="text-right shrink-0">
                              <p className="text-sm font-black text-white">
                                ₹
                                {subtotal.toFixed(
                                  0
                                )}
                              </p>

                              {item.discount >
                                0 && (
                                <p className="text-[10px] text-emerald-400">
                                  {
                                    item.discount
                                  }
                                  % OFF
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ACTIONS */}

                          <div
                            className="
                              mt-3
                              flex
                              flex-col
                              sm:flex-row
                              sm:items-center
                              justify-between
                              gap-3
                            "
                          >
                            {/* QUANTITY */}

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 mr-1">
                                Qty
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.productId
                                  )
                                }
                                disabled={
                                  quantity <=
                                  1
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  bg-slate-800
                                  text-white
                                  font-black
                                  hover:bg-slate-700
                                  disabled:opacity-30
                                  disabled:cursor-not-allowed
                                "
                              >
                                −
                              </button>

                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                  quantity
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateQuantity(
                                    item.productId,
                                    e.target
                                      .value
                                  )
                                }
                                className="
                                  w-14
                                  h-8
                                  rounded-lg
                                  bg-slate-950
                                  border
                                  border-slate-700
                                  text-white
                                  text-center
                                  text-sm
                                  font-bold
                                  outline-none
                                "
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item.productId
                                  )
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  bg-slate-800
                                  text-white
                                  font-black
                                  hover:bg-slate-700
                                "
                              >
                                +
                              </button>
                            </div>

                            {/* ADD */}

                            <button
                              type="button"
                              onClick={() =>
                                askAddToCart(
                                  item
                                )
                              }
                              disabled={
                                cartLoading
                              }
                              className="
                                px-5
                                py-2
                                rounded-xl
                                bg-emerald-500
                                hover:bg-emerald-400
                                text-slate-950
                                font-black
                                text-sm
                                transition
                                disabled:opacity-50
                              "
                            >
                              🛒 Add ×{" "}
                              {quantity}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* SUMMARY */}

                <div
                  className="
                    mt-5
                    pt-4
                    border-t
                    border-slate-800
                  "
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Basket Total
                    </span>

                    <span className="text-white font-black">
                      ₹
                      {calculatedTotal.toFixed(
                        0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">
                      AI Savings
                    </span>

                    <span className="text-emerald-400 font-black">
                      ₹
                      {Number(
                        result.savings ||
                          0
                      ).toFixed(0)}
                    </span>
                  </div>

                  {result.budget >
                    0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-400">
                        Remaining Budget
                      </span>

                      <span className="text-cyan-400 font-black">
                        ₹
                        {calculatedRemainingBudget.toFixed(
                          0
                        )}
                      </span>
                    </div>
                  )}

                  {/* ADD ALL */}

                  <button
                    type="button"
                    onClick={
                      askAddEntireBasket
                    }
                    disabled={
                      cartLoading
                    }
                    className="
                      mt-5
                      w-full
                      rounded-xl
                      py-3
                      bg-emerald-500
                      hover:bg-emerald-400
                      text-slate-950
                      font-black
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    🛒 Add All to Cart
                  </button>

                  <p className="text-center text-[11px] text-slate-600 mt-2">
                    You can change quantity before
                    adding products to your cart.
                  </p>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      {confirmModal.open && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            p-4
            bg-black/70
            backdrop-blur-sm
          "
          onClick={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !cartLoading
            ) {
              closeConfirmModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              bg-slate-900
              border
              border-slate-700
              shadow-2xl
              p-6
            "
          >
            {/* ICON */}

            <div
              className="
                w-16
                h-16
                mx-auto
                rounded-2xl
                bg-emerald-500/10
                border
                border-emerald-500/20
                flex
                items-center
                justify-center
                text-3xl
                mb-4
              "
            >
              🛒
            </div>

            {/* TITLE */}

            <h3 className="text-xl font-black text-white text-center">
              Add to Cart?
            </h3>

            {/* SINGLE */}

            {confirmModal.type ===
              "single" &&
              confirmModal.item && (
                <div className="mt-4 text-center">
                  <p className="text-slate-300">
                    Do you want to add this item
                    to your cart?
                  </p>

                  <p className="text-white font-black mt-2">
                    {
                      confirmModal
                        .item.name
                    }
                  </p>

                  <div
                    className="
                      mt-4
                      rounded-2xl
                      bg-slate-950
                      p-4
                    "
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Quantity
                      </span>

                      <span className="text-white font-black">
                        {getQuantity(
                          confirmModal
                            .item
                            .quantity
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between mt-2">
                      <span className="text-slate-500">
                        Total
                      </span>

                      <span className="text-emerald-400 font-black">
                        ₹
                        {(
                          getPrice(
                            confirmModal
                              .item
                          ) *
                          getQuantity(
                            confirmModal
                              .item
                              .quantity
                          )
                        ).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* ALL */}

            {confirmModal.type ===
              "all" && (
              <div className="mt-4 text-center">
                <p className="text-slate-300">
                  Do you want to add the complete
                  AI recommended basket to your
                  cart?
                </p>

                <div
                  className="
                    mt-4
                    rounded-2xl
                    bg-slate-950
                    p-4
                  "
                >
                  <p className="text-sm text-slate-400">
                    {result?.products
                      ?.length || 0}{" "}
                    products
                  </p>

                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    ₹
                    {calculatedTotal.toFixed(
                      0
                    )}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    Each product will be added
                    with its selected quantity.
                  </p>
                </div>
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={
                  closeConfirmModal
                }
                disabled={
                  cartLoading
                }
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-slate-800
                  hover:bg-slate-700
                  text-white
                  font-bold
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  cartLoading
                }
                onClick={() => {
                  if (
                    confirmModal.type ===
                    "single"
                  ) {
                    addSingleProduct(
                      confirmModal.item
                    );
                  }

                  if (
                    confirmModal.type ===
                    "all"
                  ) {
                    addEntireBasket();
                  }
                }}
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-emerald-500
                  hover:bg-emerald-400
                  text-slate-950
                  font-black
                  disabled:opacity-50
                "
              >
                {cartLoading
                  ? "Adding..."
                  : "Yes, Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICopilot;