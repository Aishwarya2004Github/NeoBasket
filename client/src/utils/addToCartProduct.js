import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

/**
 * Add / update ONE product in the real cart.
 *
 * Example:
 *
 * addToCartProduct("bananaId", 3)
 *
 * Result:
 * Banana quantity = 3
 *
 * IMPORTANT:
 * This function SETS quantity.
 * It does NOT increment quantity.
 */
export async function addToCartProduct(
  productId,
  quantity = 1
) {
  // =========================================================
  // VALIDATE PRODUCT ID
  // =========================================================

  if (!productId) {
    return {
      success: false,
      error: true,
      message: "Missing product id",
    };
  }

  try {
    // =======================================================
    // NORMALIZE QUANTITY
    // =======================================================

    const targetQty = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    const normalizedProductId =
      String(productId).trim();

    console.log(
      "================================"
    );
    console.log("ADD TO CART");
    console.log(
      "PRODUCT ID:",
      normalizedProductId
    );
    console.log(
      "TARGET QUANTITY:",
      targetQty
    );
    console.log(
      "================================"
    );

    // =======================================================
    // STEP 1
    // TRY TO ADD PRODUCT
    //
    // If product already exists, backend can return 400.
    // We ignore only 400 and continue to update quantity.
    // =======================================================

    let addResponse = null;

    try {
      addResponse = await Axios({
        ...SummaryApi.addTocart,

        data: {
          productId: normalizedProductId,
        },
      });

      console.log(
        "ADD TO CART RESPONSE:",
        addResponse?.data
      );
    } catch (error) {
      const status =
        error?.response?.status;

      // -----------------------------------------------------
      // Product already exists
      // -----------------------------------------------------

      if (status === 400) {
        console.log(
          "Product already exists in cart."
        );

        console.log(
          "Fetching cart and setting quantity..."
        );
      } else {
        // ---------------------------------------------------
        // Any other error is a real error
        // ---------------------------------------------------

        throw error;
      }
    }

    // =======================================================
    // STEP 2
    // GET LATEST CART
    // =======================================================

    const cartResponse = await Axios({
      ...SummaryApi.getCartItem,
    });

    const cartData =
      cartResponse?.data;

    console.log(
      "CART RESPONSE:",
      cartData
    );

    // =======================================================
    // SUPPORT DIFFERENT BACKEND RESPONSE STRUCTURES
    // =======================================================

    const cart =
      cartData?.data ||
      cartData?.items ||
      cartData?.cart ||
      [];

    if (!Array.isArray(cart)) {
      console.error(
        "Invalid cart response:",
        cartData
      );

      return {
        success: false,
        error: true,
        message: "Unable to read cart",
      };
    }

    // =======================================================
    // STEP 3
    // FIND PRODUCT IN CART
    // =======================================================

    const cartItem = cart.find(
      (item) => {
        const cartProductId =
          item?.productId ??
          item?.product?.productId ??
          item?.product?.id ??
          item?.product?._id ??
          item?.product_id;

        if (!cartProductId) {
          return false;
        }

        return (
          String(cartProductId).trim() ===
          normalizedProductId
        );
      }
    );

    // =======================================================
    // PRODUCT NOT FOUND
    // =======================================================

    if (!cartItem) {
      console.error(
        "Product was not found in cart after add:",
        normalizedProductId
      );

      return (
        addResponse?.data || {
          success: false,
          error: true,
          message:
            "Product could not be added to cart",
        }
      );
    }

    // =======================================================
    // STEP 4
    // GET CART ITEM ID
    //
    // IMPORTANT:
    // Do NOT use productId here.
    //
    // We need the actual cart item's ID.
    // =======================================================

    const cartItemId =
      cartItem?._id ??
      cartItem?.id ??
      cartItem?.cartItemId;

    if (!cartItemId) {
      console.error(
        "Cart item ID missing:",
        cartItem
      );

      return {
        success: false,
        error: true,
        message:
          "Cart item id is missing",
      };
    }

    // =======================================================
    // STEP 5
    // UPDATE QUANTITY
    //
    // IMPORTANT:
    //
    // This SETS the quantity.
    //
    // Example:
    // Existing quantity = 1
    // targetQty = 3
    //
    // Result = 3
    //
    // NOT:
    // 1 + 3 = 4
    // =======================================================

    console.log(
      "================================"
    );

    console.log(
      "UPDATING CART ITEM"
    );

    console.log(
      "CART ITEM ID:",
      String(cartItemId)
    );

    console.log(
      "SETTING QUANTITY:",
      targetQty
    );

    console.log(
      "================================"
    );

    const updateResponse =
      await Axios({
        ...SummaryApi.updateCartItemQty,

        data: {
          _id: String(cartItemId),

          // Backend should read this field
          qty: targetQty,
        },
      });

    // =======================================================
    // UPDATE RESPONSE
    // =======================================================

    console.log(
      "CART UPDATE RESPONSE:",
      updateResponse?.data
    );

    return (
      updateResponse?.data || {
        success: true,
        error: false,
        message:
          "Product quantity updated",
      }
    );
  } catch (error) {
    // =======================================================
    // ERROR HANDLING
    // =======================================================

    console.error(
      "addToCartProduct ERROR:",
      error
    );

    return {
      success: false,
      error: true,

      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to add product",
    };
  }
}