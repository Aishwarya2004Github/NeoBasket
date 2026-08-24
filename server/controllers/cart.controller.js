import prisma from "../config/prisma.js";

/*
=========================================================
ADD TO CART
=========================================================

IMPORTANT:

Product stock ko cart mein add/update karne par
REDUCE NAHI kiya jayega.

Example:

Product stock = 50

Customer cart quantity = 10

Product stock database mein = 50 hi rahega.

Actual stock deduction ORDER DELIVERED hone par hoga.
=========================================================
*/

export const addToCartItemController = async (
  request,
  response
) => {
  try {
    const userId = request.userId;

    const {
      productId,
      quantity = 1
    } = request.body;

    /*
    -----------------------------------------------------
    USER CHECK
    -----------------------------------------------------
    */

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    PRODUCT ID CHECK
    -----------------------------------------------------
    */

    if (!productId) {
      return response.status(400).json({
        message: "Provide productId",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    QUANTITY VALIDATION
    -----------------------------------------------------
    */

    const finalQuantity = Math.floor(
      Number(quantity)
    );

    if (
      !Number.isFinite(finalQuantity) ||
      finalQuantity < 1
    ) {
      return response.status(400).json({
        message: "Quantity must be at least 1",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    GET PRODUCT
    -----------------------------------------------------
    */

    const product =
      await prisma.product.findUnique({
        where: {
          id: String(productId)
        }
      });

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    CURRENT AVAILABLE STOCK
    -----------------------------------------------------
    */

    const availableStock =
      Number(product.stock ?? 0);

    /*
    -----------------------------------------------------
    OUT OF STOCK
    -----------------------------------------------------
    */

    if (availableStock <= 0) {
      return response.status(400).json({
        message:
          `${product.name} is currently out of stock`,

        error: true,
        success: false,

        outOfStock: true,

        availableStock: 0
      });
    }

    /*
    -----------------------------------------------------
    QUANTITY CANNOT EXCEED STOCK
    -----------------------------------------------------
    */

    if (finalQuantity > availableStock) {
      return response.status(400).json({
        message:
          `Only ${availableStock} units of ${product.name} are available`,

        error: true,
        success: false,

        outOfStock: false,

        availableStock
      });
    }

    /*
    -----------------------------------------------------
    CHECK EXISTING CART ITEM
    -----------------------------------------------------
    */

    const existingCartItem =
      await prisma.cartProduct.findFirst({
        where: {
          userId,
          productId: String(productId)
        }
      });

    /*
    =====================================================
    EXISTING CART ITEM
    =====================================================
    */

    if (existingCartItem) {

      /*
      -----------------------------------------------
      IMPORTANT

      We are treating quantity as the FINAL quantity.

      Example:

      Current cart = 2
      Request quantity = 5

      Result = 5

      NOT:

      2 + 5 = 7
      -----------------------------------------------
      */

      const updatedCartItem =
        await prisma.cartProduct.update({

          where: {
            id: existingCartItem.id
          },

          data: {
            quantity: finalQuantity
          }
        });

      return response.json({

        data: {

          ...updatedCartItem,

          availableStock,

          isOutOfStock:
            availableStock <= 0
        },

        message:
          "Cart quantity updated successfully",

        error: false,

        success: true
      });
    }

    /*
    =====================================================
    CREATE NEW CART ITEM
    =====================================================
    */

    const savedCartItem =
      await prisma.cartProduct.create({

        data: {

          quantity: finalQuantity,

          userId,

          productId:
            String(productId)
        }
      });

    return response.json({

      data: {

        ...savedCartItem,

        availableStock,

        isOutOfStock:
          availableStock <= 0
      },

      message:
        "Item added successfully",

      error: false,

      success: true
    });

  } catch (error) {

    console.error(
      "ADD TO CART ERROR:",
      error
    );

    return response.status(500).json({

      message:
        error?.message ||
        "Unable to add item to cart",

      error: true,

      success: false
    });
  }
};


/*
=========================================================
GET CART ITEMS
=========================================================

Cart quantity ko stock se subtract NAHI karna.

Example:

Product stock = 50
Cart quantity = 10

Available stock = 50

NOT 40.

Because stock is only reduced after DELIVERED.
=========================================================
*/

export const getCartItemController = async (
  request,
  response
) => {
  try {

    const userId = request.userId;

    /*
    -----------------------------------------------------
    USER CHECK
    -----------------------------------------------------
    */

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    GET CART
    -----------------------------------------------------
    */

    const cartItems =
      await prisma.cartProduct.findMany({

        where: {
          userId
        },

        include: {
          product: true
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    /*
    -----------------------------------------------------
    ADD STOCK INFORMATION
    -----------------------------------------------------
    */

    const data = cartItems.map(
      (item) => {

        const availableStock =
          Number(item.product?.stock ?? 0);

        return {

          ...item,

          availableStock,

          isOutOfStock:
            availableStock <= 0,

          stockStatus:
            availableStock <= 0
              ? "OUT_OF_STOCK"
              : availableStock <= 5
              ? "LOW_STOCK"
              : "IN_STOCK",

          /*
          Useful for frontend.

          If current cart quantity is greater
          than current stock, frontend can show
          a warning.
          */

          quantityExceedsStock:
            Number(item.quantity) >
            availableStock
        };
      }
    );

    return response.json({

      data,

      error: false,

      success: true
    });

  } catch (error) {

    console.error(
      "GET CART ERROR:",
      error
    );

    return response.status(500).json({

      message:
        error?.message ||
        "Unable to get cart",

      error: true,

      success: false
    });
  }
};


/*
=========================================================
UPDATE CART ITEM QUANTITY
=========================================================

Frontend:

{
  "_id": "CART_ITEM_ID",
  "qty": 5
}

IMPORTANT:

_id = CART ITEM ID

NOT PRODUCT ID.

=========================================================
*/

export const updateCartItemQtyController = async (
  request,
  response
) => {
  try {

    const userId = request.userId;

    const {
      _id,
      qty
    } = request.body;

    /*
    -----------------------------------------------------
    USER CHECK
    -----------------------------------------------------
    */

    if (!userId) {
      return response.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    CART ITEM ID CHECK
    -----------------------------------------------------
    */

    if (!_id) {
      return response.status(400).json({
        message:
          "Provide cart item _id",

        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    QUANTITY CHECK
    -----------------------------------------------------
    */

    const parsedQty =
      Number(qty);

    if (
      !Number.isFinite(parsedQty) ||
      parsedQty < 1
    ) {
      return response.status(400).json({
        message:
          "Quantity must be at least 1",

        error: true,
        success: false
      });
    }

    const finalQty =
      Math.floor(parsedQty);

    /*
    -----------------------------------------------------
    FIND CART ITEM
    -----------------------------------------------------
    */

    const cartItem =
      await prisma.cartProduct.findFirst({

        where: {

          id: String(_id),

          userId
        },

        include: {
          product: true
        }
      });

    if (!cartItem) {
      return response.status(404).json({
        message:
          "Cart item not found",

        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    GET CURRENT PRODUCT STOCK
    -----------------------------------------------------
    */

    const availableStock =
      Number(
        cartItem.product?.stock ?? 0
      );

    /*
    -----------------------------------------------------
    PRODUCT OUT OF STOCK
    -----------------------------------------------------
    */

    if (availableStock <= 0) {
      return response.status(400).json({

        message:
          `${cartItem.product.name} is currently out of stock`,

        error: true,

        success: false,

        outOfStock: true,

        availableStock: 0
      });
    }

    /*
    -----------------------------------------------------
    QUANTITY CANNOT EXCEED STOCK
    -----------------------------------------------------
    */

    if (finalQty > availableStock) {

      return response.status(400).json({

        message:
          `Only ${availableStock} units of ${cartItem.product.name} are available`,

        error: true,

        success: false,

        outOfStock: false,

        availableStock,

        requestedQuantity:
          finalQty
      });
    }

    /*
    -----------------------------------------------------
    UPDATE CART
    -----------------------------------------------------
    */

    const updatedCartItem =
      await prisma.cartProduct.update({

        where: {

          id: cartItem.id
        },

        data: {

          quantity: finalQty
        },

        include: {
          product: true
        }
      });

    return response.json({

      message:
        "Cart quantity updated",

      success: true,

      error: false,

      data: {

        ...updatedCartItem,

        availableStock,

        isOutOfStock:
          availableStock <= 0
      }
    });

  } catch (error) {

    console.error(
      "UPDATE CART QUANTITY ERROR:",
      error
    );

    return response.status(500).json({

      message:
        error?.message ||
        "Unable to update cart quantity",

      error: true,

      success: false
    });
  }
};


/*
=========================================================
DELETE CART ITEM
=========================================================
*/

export const deleteCartItemQtyController = async (
  request,
  response
) => {
  try {

    const userId = request.userId;

    const {
      _id
    } = request.body;

    /*
    -----------------------------------------------------
    USER CHECK
    -----------------------------------------------------
    */

    if (!userId) {
      return response.status(401).json({
        message:
          "User not authenticated",

        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    CART ITEM ID CHECK
    -----------------------------------------------------
    */

    if (!_id) {
      return response.status(400).json({
        message:
          "Provide cart item _id",

        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    FIND USER CART ITEM
    -----------------------------------------------------
    */

    const cartItem =
      await prisma.cartProduct.findFirst({

        where: {

          id: String(_id),

          userId
        }
      });

    if (!cartItem) {
      return response.status(404).json({
        message:
          "Cart item not found",

        error: true,
        success: false
      });
    }

    /*
    -----------------------------------------------------
    DELETE
    -----------------------------------------------------
    */

    const deletedCartItem =
      await prisma.cartProduct.delete({

        where: {

          id: cartItem.id
        }
      });

    return response.json({

      message:
        "Item removed",

      error: false,

      success: true,

      data: deletedCartItem
    });

  } catch (error) {

    console.error(
      "DELETE CART ITEM ERROR:",
      error
    );

    return response.status(500).json({

      message:
        error?.message ||
        "Unable to remove cart item",

      error: true,

      success: false
    });
  }
};