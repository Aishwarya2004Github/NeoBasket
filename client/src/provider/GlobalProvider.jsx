import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

import { useDispatch, useSelector } from "react-redux";

import { handleAddItemCart } from "../store/cartProduct";
import { handleAddAddress } from "../store/addressSlice";
import { setOrder } from "../store/orderSlice";

import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";

import { pricewithDiscount } from "../utils/PriceWithDiscount";

export const GlobalContext = createContext(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();

  // =====================================================
  // STATE
  // =====================================================

  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] =
    useState(0);
  const [totalQty, setTotalQty] = useState(0);

  // =====================================================
  // REDUX
  // =====================================================

  const cartItem = useSelector(
    (state) => state.cartItem?.cart || []
  );

  const user = useSelector((state) => state.user);

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem
      });

      const { data } = response;

      if (data?.success) {
        dispatch(
          handleAddItemCart(data?.data || [])
        );
      }
    } catch (error) {
      console.log(
        "FETCH CART ERROR:",
        error
      );
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = async (
    product,
    quantity = 1
  ) => {
    try {
      if (!product) {
        toast.error(
          "Product not found"
        );

        return null;
      }

      // Product ID support
      const productId =
        product?._id ||
        product?.id ||
        product?.productId;

      if (!productId) {
        console.error(
          "PRODUCT ID NOT FOUND:",
          product
        );

        toast.error(
          "Product ID not found"
        );

        return null;
      }

      const qty = Math.max(
        1,
        Number(quantity) || 1
      );

      console.log(
        "ADDING PRODUCT TO CART:",
        {
          productId,
          quantity: qty
        }
      );

      // Backend API call
      const response = await Axios({
        ...SummaryApi.addTocart,

        data: {
          productId: productId,
          quantity: qty
        }
      });

      const { data } = response;

      console.log(
        "ADD CART RESPONSE:",
        data
      );

      if (data?.success) {
        // Backend cart se fresh data lao
        await fetchCartItem();

        toast.success(
          data?.message ||
            "Product added to cart"
        );

        return data;
      }

      toast.error(
        data?.message ||
          "Product could not be added"
      );

      return null;
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      AxiosToastError(error);

      return null;
    }
  };

  // =====================================================
  // UPDATE CART
  // =====================================================

  const updateCartItem = async (
    _id,
    qty
  ) => {
    try {
      if (
        !_id ||
        Number(qty) < 1
      ) {
        return null;
      }

      const response = await Axios({
        ...SummaryApi.updateCartItemQty,

        data: {
          _id,
          qty: Number(qty)
        }
      });

      const { data } = response;

      if (data?.success) {
        await fetchCartItem();

        return data;
      }

      return null;
    } catch (error) {
      console.error(
        "UPDATE CART ERROR:",
        error
      );

      AxiosToastError(error);

      return null;
    }
  };

  // =====================================================
  // DELETE CART
  // =====================================================

  const deleteCartItem = async (
    _id
  ) => {
    try {
      if (!_id) {
        return null;
      }

      const response = await Axios({
        ...SummaryApi.deleteCartItem,

        data: {
          _id
        }
      });

      const { data } = response;

      if (data?.success) {
        toast.success(
          data?.message ||
            "Item removed from cart"
        );

        await fetchCartItem();

        return data;
      }

      return null;
    } catch (error) {
      console.error(
        "DELETE CART ERROR:",
        error
      );

      AxiosToastError(error);

      return null;
    }
  };

  // =====================================================
  // FETCH ADDRESS
  // =====================================================

  const fetchAddress = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAddress
      });

      const { data } = response;

      if (data?.success) {
        dispatch(
          handleAddAddress(
            data?.data || []
          )
        );
      }
    } catch (error) {
      console.log(
        "FETCH ADDRESS ERROR:",
        error
      );
    }
  };

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems
      });

      const { data } = response;

      if (data?.success) {
        dispatch(
          setOrder(
            data?.data || []
          )
        );
      }
    } catch (error) {
      console.log(
        "FETCH ORDER ERROR:",
        error
      );
    }
  };

  // =====================================================
  // CALCULATE CART TOTAL
  // =====================================================

  useEffect(() => {
    if (
      !Array.isArray(cartItem)
    ) {
      setTotalQty(0);
      setTotalPrice(0);
      setNotDiscountTotalPrice(0);

      return;
    }

    // -----------------------------
    // TOTAL QTY
    // -----------------------------

    const qty =
      cartItem.reduce(
        (prev, curr) => {
          return (
            prev +
            Number(
              curr?.quantity || 0
            )
          );
        },
        0
      );

    setTotalQty(qty);

    // -----------------------------
    // DISCOUNTED PRICE
    // -----------------------------

    const total =
      cartItem.reduce(
        (prev, curr) => {
          const product =
            curr?.product ||
            curr?.productId ||
            curr;

          const price =
            pricewithDiscount(
              Number(
                product?.price || 0
              ),
              Number(
                product?.discount ||
                  0
              )
            );

          return (
            prev +
            price *
              Number(
                curr?.quantity || 0
              )
          );
        },
        0
      );

    setTotalPrice(total);

    // -----------------------------
    // WITHOUT DISCOUNT
    // -----------------------------

    const withoutDiscount =
      cartItem.reduce(
        (prev, curr) => {
          const product =
            curr?.product ||
            curr?.productId ||
            curr;

          return (
            prev +
            Number(
              product?.price || 0
            ) *
              Number(
                curr?.quantity || 0
              )
          );
        },
        0
      );

    setNotDiscountTotalPrice(
      withoutDiscount
    );
  }, [cartItem]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogoutOut = () => {
    localStorage.clear();

    dispatch(
      handleAddItemCart([])
    );
  };

  // =====================================================
  // LOAD USER DATA
  // =====================================================

  useEffect(() => {
    if (
      !(user?._id || user?.id)
    ) {
      return;
    }

    const loadData =
      async () => {
        await fetchCartItem();
        await fetchAddress();
        await fetchOrder();
      };

    loadData();
  }, [user]);

  // =====================================================
  // AI CART → REGULAR CART
  // =====================================================

  useEffect(() => {
    const handleAICartAdd =
      async (event) => {
        try {
          console.log(
            "AI CART EVENT:",
            event?.detail
          );

          const product =
            event?.detail?.product;

          const quantity = Math.max(
            1,
            Number(
              event?.detail
                ?.quantity ||
                product?.quantity ||
                1
            )
          );

          if (!product) {
            console.error(
              "AI CART PRODUCT MISSING"
            );

            toast.error(
              "AI cart product missing"
            );

            return;
          }

          console.log(
            "AI CART → REGULAR CART:",
            product,
            quantity
          );

          // ACTUAL ADD TO CART
          const result =
            await addToCart(
              product,
              quantity
            );

          if (
            result?.success
          ) {
            console.log(
              "AI PRODUCT ADDED TO REGULAR CART"
            );

            // Extra refresh
            await fetchCartItem();
          }
        } catch (error) {
          console.error(
            "AI CART ERROR:",
            error
          );
        }
      };

    window.addEventListener(
      "NeoBasket:add-to-cart",
      handleAICartAdd
    );

    return () => {
      window.removeEventListener(
        "NeoBasket:add-to-cart",
        handleAICartAdd
      );
    };
  }, []);

  // =====================================================
  // CONTEXT PROVIDER
  // =====================================================

  return (
    <GlobalContext.Provider
      value={{
        fetchCartItem,

        addToCart,

        updateCartItem,

        deleteCartItem,

        fetchAddress,

        fetchOrder,

        totalPrice,

        totalQty,

        notDiscountTotalPrice,

        handleLogoutOut
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;