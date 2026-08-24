import Stripe from "../config/stripe.js";
import prisma from "../config/prisma.js";

// =========================================================
// PRICE AFTER DISCOUNT
// =========================================================

export const pricewithDiscount = (price, dis = 0) => {
  const finalPrice = Number(price) || 0;
  const discount = Number(dis) || 0;

  const discountAmount = Math.ceil(
    (finalPrice * discount) / 100
  );

  return Math.max(0, finalPrice - discountAmount);
};

// =========================================================
// GENERATE ORDER ID
// =========================================================

const generateOrderId = () => {
  return `ORD-${Date.now()}-${Math.floor(
    Math.random() * 1000000
  )}`;
};

// =========================================================
// GET PRODUCT ID
// =========================================================

const getProductId = (item) => {
  const product = item?.product || item?.productId;

  if (!product) {
    return null;
  }

  if (typeof product === "string") {
    return product;
  }

  if (typeof product === "object") {
    return product?.id || product?._id || null;
  }

  return null;
};

// =========================================================
// GET QUANTITY
// =========================================================

const getQuantity = (item) => {
  const quantity = Math.floor(
    Number(
      item?.quantity ??
        item?.qty ??
        1
    )
  );

  if (!Number.isFinite(quantity) || quantity < 1) {
    return null;
  }

  return quantity;
};

// =========================================================
// GET DATABASE PRODUCT
// =========================================================

const getDBProduct = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is missing");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: String(productId),
    },
  });

  if (!product) {
    throw new Error(
      `Product not found: ${productId}`
    );
  }

  return product;
};

// =========================================================
// VALIDATE STOCK
// =========================================================

const validateStock = (product, quantity) => {
  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    throw new Error(
      `${product.name} is currently out of stock`
    );
  }

  if (quantity > stock) {
    throw new Error(
      `${product.name} has only ${stock} units available`
    );
  }
};

// =========================================================
// DEDUCT STOCK ATOMICALLY
//
// IMPORTANT:
// Stock is reduced immediately when order is created.
//
// Uses updateMany with stock >= quantity so stock
// cannot become negative in concurrent orders.
// =========================================================

const deductProductStock = async (
  tx,
  productId,
  quantity
) => {
  const result = await tx.product.updateMany({
    where: {
      id: String(productId),
      stock: {
        gte: quantity,
      },
    },

    data: {
      stock: {
        decrement: quantity,
      },
    },
  });

  if (result.count === 0) {
    const product = await tx.product.findUnique({
      where: {
        id: String(productId),
      },
      select: {
        name: true,
        stock: true,
      },
    });

    if (!product) {
      throw new Error(
        `Product not found: ${productId}`
      );
    }

    throw new Error(
      `${product.name} has only ${Number(
        product.stock || 0
      )} units available`
    );
  }

  // Automatically unpublish when stock becomes 0
  const updatedProduct =
    await tx.product.findUnique({
      where: {
        id: String(productId),
      },
      select: {
        id: true,
        stock: true,
      },
    });

  if (updatedProduct) {
    await tx.product.update({
      where: {
        id: updatedProduct.id,
      },

      data: {
        publish:
          Number(updatedProduct.stock || 0) > 0,
      },
    });
  }

  console.log(
    `STOCK DEDUCTED | PRODUCT: ${productId} | QTY: ${quantity}`
  );

  return true;
};

// =========================================================
// RESTORE PRODUCT STOCK
//
// Used when an order is cancelled AFTER stock was deducted.
// =========================================================

const restoreProductStock = async (
  tx,
  productId,
  quantity
) => {
  if (!productId || quantity <= 0) {
    return;
  }

  await tx.product.update({
    where: {
      id: String(productId),
    },

    data: {
      stock: {
        increment: quantity,
      },

      // Product becomes available again
      publish: true,
    },
  });

  console.log(
    `STOCK RESTORED | PRODUCT: ${productId} | QTY: +${quantity}`
  );
};

// =========================================================
// CASH ON DELIVERY
//
// STOCK IS DEDUCTED IMMEDIATELY WHEN ORDER IS PLACED.
// =========================================================

export async function CashOnDeliveryOrderController(
  request,
  response
) {
  try {
    const userId = request.userId;

    const {
      list_items,
      addressId,
    } = request.body;

    // -----------------------------------------------------
    // USER CHECK
    // -----------------------------------------------------

    if (!userId) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "User not authenticated",
      });
    }

    // -----------------------------------------------------
    // USER
    // -----------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    if (user.role === "ADMIN") {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Admin cannot place order",
      });
    }

    // -----------------------------------------------------
    // ADDRESS
    // -----------------------------------------------------

    if (!addressId) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Delivery address is required",
      });
    }

    const address =
      await prisma.address.findFirst({
        where: {
          id: String(addressId),
          userId,
        },
      });

    if (!address) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Delivery address not found",
      });
    }

    // -----------------------------------------------------
    // CART
    // -----------------------------------------------------

    if (
      !Array.isArray(list_items) ||
      list_items.length === 0
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Cart is empty",
      });
    }

    // -----------------------------------------------------
    // ONE ORDER ID
    // -----------------------------------------------------

    const orderId = generateOrderId();

    // -----------------------------------------------------
    // TRANSACTION
    //
    // Order creation + stock deduction + cart clearing
    // all happen together.
    // -----------------------------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        const payload = [];

        let calculatedTotal = 0;

        // -------------------------------------------------
        // PRODUCTS
        // -------------------------------------------------

        for (const item of list_items) {
          const productId =
            getProductId(item);

          if (!productId) {
            throw new Error(
              "Product ID is missing"
            );
          }

          const quantity =
            getQuantity(item);

          if (!quantity) {
            throw new Error(
              "Invalid product quantity"
            );
          }

          const dbProduct =
            await tx.product.findUnique({
              where: {
                id: String(productId),
              },
            });

          if (!dbProduct) {
            throw new Error(
              `Product not found: ${productId}`
            );
          }

          // -----------------------------------------------
          // CHECK STOCK
          // -----------------------------------------------

          validateStock(
            dbProduct,
            quantity
          );

          // -----------------------------------------------
          // DEDUCT STOCK IMMEDIATELY
          // -----------------------------------------------

          await deductProductStock(
            tx,
            productId,
            quantity
          );

          // -----------------------------------------------
          // PRICE
          // -----------------------------------------------

          const finalPrice =
            pricewithDiscount(
              dbProduct.price,
              dbProduct.discount
            );

          const itemTotal =
            finalPrice * quantity;

          calculatedTotal += itemTotal;

          // -----------------------------------------------
          // ORDER ITEM
          // -----------------------------------------------

          payload.push({
            userId,

            orderId,

            productId:
              String(productId),

            product_name:
              dbProduct.name,

            product_image:
              dbProduct.image || [],

            paymentId: "",

            payment_status:
              "CASH ON DELIVERY",

            status: "PENDING",

            delivery_addressId:
              String(addressId),

            quantity,

            subTotalAmt:
              itemTotal,

            totalAmt:
              itemTotal,

            // VERY IMPORTANT
            stockDeducted: true,
          });
        }

        // -------------------------------------------------
        // CREATE ORDER
        // -------------------------------------------------

        const order =
          await tx.order.createMany({
            data: payload,
          });

        // -------------------------------------------------
        // CLEAR CART
        // -------------------------------------------------

        await tx.cartProduct.deleteMany({
          where: {
            userId,
          },
        });

        return {
          order,
          totalAmt: calculatedTotal,
        };
      }
    );

    return response.status(200).json({
      success: true,
      error: false,

      message:
        "Order placed successfully",

      data: {
        orderId,

        order:
          result.order,

        totalAmt:
          result.totalAmt,
      },
    });

  } catch (error) {
    console.error(
      "CASH ON DELIVERY ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Failed to place order",
    });
  }
}

// =========================================================
// STRIPE PAYMENT
//
// IMPORTANT:
// Stock is checked here but NOT deducted yet.
//
// Stripe payment is deducted in webhook after successful
// payment.
// =========================================================

export async function paymentController(
  request,
  response
) {
  try {
    const userId =
      request.userId;

    if (!userId) {
      return response.status(401).json({
        success: false,
        error: true,
        message:
          "User not authenticated",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "User not found",
      });
    }

    if (user.role === "ADMIN") {
      return response.status(403).json({
        success: false,
        error: true,
        message:
          "Admin cannot place order",
      });
    }

    const {
      list_items,
      addressId,
    } = request.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !Array.isArray(list_items) ||
      list_items.length === 0
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Cart is empty",
      });
    }

    if (!addressId) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Delivery address is required",
      });
    }

    const address =
      await prisma.address.findFirst({
        where: {
          id: String(addressId),
          userId,
        },
      });

    if (!address) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "Delivery address not found",
      });
    }

    // -----------------------------------------------------
    // STRIPE LINE ITEMS
    // -----------------------------------------------------

    const line_items = [];

    for (const item of list_items) {
      const productId =
        getProductId(item);

      if (!productId) {
        throw new Error(
          "Product ID is missing"
        );
      }

      const quantity =
        getQuantity(item);

      if (!quantity) {
        throw new Error(
          "Invalid quantity"
        );
      }

      const dbProduct =
        await getDBProduct(
          productId
        );

      // Only CHECK here.
      // Deduction happens in Stripe webhook.
      validateStock(
        dbProduct,
        quantity
      );

      const finalPrice =
        pricewithDiscount(
          dbProduct.price,
          dbProduct.discount
        );

      line_items.push({
        price_data: {
          currency: "inr",

          product_data: {
            name:
              dbProduct.name,

            images:
              Array.isArray(
                dbProduct.image
              )
                ? dbProduct.image.slice(
                    0,
                    8
                  )
                : [],

            metadata: {
              productId:
                String(productId),
            },
          },

          unit_amount:
            Math.round(
              finalPrice * 100
            ),
        },

        quantity,

        adjustable_quantity: {
          enabled: false,
        },
      });
    }

    // -----------------------------------------------------
    // STRIPE SESSION
    // -----------------------------------------------------

    const params = {
      submit_type: "pay",

      mode: "payment",

      payment_method_types: [
        "card",
      ],

      customer_email:
        user.email,

      metadata: {
        userId:
          String(userId),

        addressId:
          String(addressId),
      },

      line_items,

      success_url:
        `${process.env.FRONTEND_URL}/success`,

      cancel_url:
        `${process.env.FRONTEND_URL}/cancel`,
    };

    const session =
      await Stripe.checkout.sessions.create(
        params
      );

    return response.status(200).json(
      session
    );

  } catch (error) {
    console.error(
      "STRIPE PAYMENT ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to create payment session",
    });
  }
}

// =========================================================
// GET STRIPE ORDER ITEMS
// =========================================================

const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
  tx,
}) => {
  const productList = [];

  const orderId =
    generateOrderId();

  for (
    const item of lineItems.data
  ) {
    const stripePrice =
      item.price;

    if (!stripePrice) {
      continue;
    }

    let stripeProduct =
      stripePrice.product;

    // -----------------------------------------------------
    // PRODUCT ID
    // -----------------------------------------------------

    if (
      typeof stripeProduct ===
      "string"
    ) {
      stripeProduct =
        await Stripe.products.retrieve(
          stripeProduct
        );
    }

    const productId =
      stripeProduct
        ?.metadata
        ?.productId;

    if (!productId) {
      throw new Error(
        `Product ID missing in Stripe metadata for ${
          stripeProduct?.name ||
          "product"
        }`
      );
    }

    const quantity =
      Math.max(
        1,
        Number(
          item.quantity || 1
        )
      );

    // -----------------------------------------------------
    // DATABASE PRODUCT
    // -----------------------------------------------------

    const dbProduct =
      await tx.product.findUnique({
        where: {
          id:
            String(productId),
        },
      });

    if (!dbProduct) {
      throw new Error(
        `Product not found: ${productId}`
      );
    }

    // -----------------------------------------------------
    // STOCK CHECK
    // -----------------------------------------------------

    validateStock(
      dbProduct,
      quantity
    );

    // -----------------------------------------------------
    // DEDUCT STOCK NOW
    //
    // Stripe payment is successful.
    // -----------------------------------------------------

    await deductProductStock(
      tx,
      productId,
      quantity
    );

    // -----------------------------------------------------
    // STRIPE AMOUNT
    // -----------------------------------------------------

    const itemTotal =
      Number(
        item.amount_total || 0
      ) / 100;

    productList.push({
      userId,

      orderId,

      productId:
        String(productId),

      product_name:
        dbProduct.name,

      product_image:
        dbProduct.image || [],

      paymentId:
        paymentId || "",

      payment_status:
        payment_status || "paid",

      status:
        "PENDING",

      delivery_addressId:
        String(addressId),

      quantity,

      subTotalAmt:
        itemTotal,

      totalAmt:
        itemTotal,

      // VERY IMPORTANT
      stockDeducted: true,
    });
  }

  return {
    orderId,
    productList,
  };
};

// =========================================================
// STRIPE WEBHOOK
// =========================================================

export async function webhookStripe(
  request,
  response
) {
  try {
    const event =
      request.body;

    console.log(
      "STRIPE WEBHOOK EVENT:",
      event.type
    );

    switch (event.type) {

      // ===================================================
      // PAYMENT COMPLETED
      // ===================================================

      case "checkout.session.completed": {
        const session =
          event.data.object;

        const userId =
          session.metadata?.userId;

        const addressId =
          session.metadata?.addressId;

        if (!userId || !addressId) {
          throw new Error(
            "Stripe session metadata missing"
          );
        }

        const paymentId =
          session.payment_intent;

        // -------------------------------------------------
        // DUPLICATE WEBHOOK PROTECTION
        // -------------------------------------------------

        if (paymentId) {
          const existingOrder =
            await prisma.order.findFirst({
              where: {
                paymentId:
                  String(paymentId),
              },
            });

          if (existingOrder) {
            console.log(
              "STRIPE ORDER ALREADY EXISTS:",
              paymentId
            );

            return response.json({
              received: true,
              duplicate: true,
            });
          }
        }

        // -------------------------------------------------
        // GET LINE ITEMS
        // -------------------------------------------------

        const lineItems =
          await Stripe.checkout.sessions.listLineItems(
            session.id,
            {
              expand: [
                "data.price.product",
              ],
            }
          );

        // -------------------------------------------------
        // TRANSACTION
        //
        // Stock deduction + order creation + cart clear
        // happen together.
        // -------------------------------------------------

        const result =
          await prisma.$transaction(
            async (tx) => {

              const {
                orderId,
                productList,
              } =
                await getOrderProductItems({
                  lineItems,

                  userId,

                  addressId,

                  paymentId,

                  payment_status:
                    session.payment_status,

                  tx,
                });

              if (
                !productList.length
              ) {
                throw new Error(
                  "No products found in Stripe order"
                );
              }

              // -------------------------------------------
              // CREATE ORDER
              // -------------------------------------------

              const order =
                await tx.order.createMany({
                  data:
                    productList,
                });

              // -------------------------------------------
              // CLEAR CART
              // -------------------------------------------

              await tx.cartProduct.deleteMany({
                where: {
                  userId,
                },
              });

              return {
                orderId,
                order,
              };
            }
          );

        console.log(
          "STRIPE ORDER CREATED:",
          result.orderId
        );

        break;
      }

      // ===================================================
      // CHECKOUT EXPIRED
      // ===================================================

      case "checkout.session.expired": {
        console.log(
          "Stripe checkout expired:",
          event.data.object.id
        );

        break;
      }

      default: {
        console.log(
          `Unhandled Stripe event type: ${event.type}`
        );
      }
    }

    return response.json({
      received: true,
    });

  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Stripe webhook failed",
    });
  }
}

// =========================================================
// USER ORDER LIST
// =========================================================

export async function getOrderDetailsController(
  request,
  response
) {
  try {
    const userId =
      request.userId;

    if (!userId) {
      return response.status(401).json({
        success: false,
        error: true,
        message:
          "User not authenticated",
      });
    }

    const orderlist =
      await prisma.order.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          product: true,
          delivery_address: true,
          deliveryPartner: true,
        },
      });

    return response.json({
      success: true,
      error: false,

      message:
        "Order list",

      data:
        orderlist,
    });

  } catch (error) {
    console.error(
      "GET USER ORDERS ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to get orders",
    });
  }
}

// =========================================================
// CANCEL ORDER - USER
//
// IMPORTANT:
// If stock was already deducted,
// cancellation RESTORES stock.
// =========================================================

export const cancelOrderController =
  async (
    request,
    response
  ) => {
    try {
      const userId =
        request.userId;

      const {
        orderId,
        reason,
      } = request.body;

      if (!userId) {
        return response.status(401).json({
          success: false,
          error: true,
          message:
            "User not authenticated",
        });
      }

      if (
        !orderId ||
        !reason
      ) {
        return response.status(400).json({
          success: false,
          error: true,
          message:
            "Order ID and cancel reason required",
        });
      }

      const cleanOrderId =
        String(orderId).trim();

      const orders =
        await prisma.order.findMany({
          where: {
            orderId:
              cleanOrderId,

            userId,
          },
        });

      if (!orders.length) {
        return response.status(404).json({
          success: false,
          error: true,
          message:
            "Order not found",
        });
      }

      // ---------------------------------------------------
      // DELIVERED
      // ---------------------------------------------------

      if (
        orders.some(
          (order) =>
            order.status ===
            "DELIVERED"
        )
      ) {
        return response.status(400).json({
          success: false,
          error: true,
          message:
            "Delivered order cannot be cancelled",
        });
      }

      // ---------------------------------------------------
      // ALREADY CANCELLED
      // ---------------------------------------------------

      if (
        orders.every(
          (order) =>
            order.status ===
            "CANCELLED"
        )
      ) {
        return response.status(400).json({
          success: false,
          error: true,
          message:
            "Order already cancelled",
        });
      }

      // ---------------------------------------------------
      // TRANSACTION
      // ---------------------------------------------------

      const updatedOrder =
        await prisma.$transaction(
          async (tx) => {

            for (
              const order
              of orders
            ) {

              // -----------------------------------------
              // RESTORE STOCK ONLY IF DEDUCTED
              // -----------------------------------------

              if (
                order.stockDeducted
              ) {
                await restoreProductStock(
                  tx,
                  order.productId,
                  Number(
                    order.quantity || 0
                  )
                );

                // -----------------------------------------
                // MARK STOCK RESTORED
                // -----------------------------------------

                await tx.order.update({
                  where: {
                    id:
                      order.id,
                  },

                  data: {
                    stockDeducted:
                      false,
                  },
                });
              }
            }

            // -------------------------------------------
            // CANCEL ORDER
            // -------------------------------------------

            return tx.order.updateMany({
              where: {
                orderId:
                  cleanOrderId,

                userId,
              },

              data: {
                status:
                  "CANCELLED",

                cancelledBy:
                  "USER",

                cancelReason:
                  reason,

                cancelledAt:
                  new Date(),

                deliveryPartnerId:
                  null,
              },
            });
          }
        );

      return response.json({
        success: true,
        error: false,

        message:
          "Order cancelled successfully and stock restored",

        data:
          updatedOrder,
      });

    } catch (error) {
      console.error(
        "CANCEL ORDER ERROR:",
        error
      );

      return response.status(500).json({
        success: false,
        error: true,

        message:
          error?.message ||
          "Unable to cancel order",
      });
    }
  };

// =========================================================
// ADMIN - ALL ORDERS
// =========================================================

export async function getAllOrdersController(
  request,
  response
) {
  try {
    const orders =
      await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: true,
          product: true,
          delivery_address: true,
          deliveryPartner: true,
        },
      });

    return response.json({
      success: true,
      error: false,

      data:
        orders,
    });

  } catch (error) {
    console.error(
      "GET ALL ORDERS ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to get orders",
    });
  }
}

// =========================================================
// TRACK ORDER
// =========================================================

// =========================================================
// TRACK ORDER
// =========================================================
const formatDate = (date) => {
  if (!date) return "N/A";

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

const formatTime = (date) => {
  if (!date) return "Pending";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Pending";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export async function trackOrderController(
  request,
  response
) {
  try {
    const { orderId } = request.body;

    if (!orderId) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Provide order ID",
      });
    }

    const cleanOrderId = String(orderId).trim();

    const orders = await prisma.order.findMany({
      where: {
        orderId: cleanOrderId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
        orderId: true,

        // IMPORTANT
        createdAt: true,
        updatedAt: true,

        status: true,

        cancelledBy: true,
        cancelReason: true,
        cancelledAt: true,

        confirmedAt: true,
        packedAt: true,
        shippedAt: true,
        dispatchedAt: true,
        outForDeliveryAt: true,
        deliveredAt: true,

        product_name: true,
        product_image: true,

        quantity: true,

        subTotalAmt: true,
        totalAmt: true,

        payment_status: true,
        paymentId: true,

        stockDeducted: true,

        product: true,
        delivery_address: true,
        deliveryPartner: true,
        user: true,
      },
    });

    if (!orders.length) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Order not found",
      });
    }

    return response.json({
      success: true,
      error: false,
      message: "Order found",
      data: orders,
    });
  } catch (error) {
    console.error("TRACK ORDER ERROR:", error);

    return response.status(500).json({
      success: false,
      error: true,
      message:
        error?.message ||
        "Unable to track order",
    });
  }
}

// =========================================================
// ADMIN UPDATE ORDER STATUS
//
// IMPORTANT CHANGE:
//
// STOCK IS NO LONGER DEDUCTED AT DELIVERED.
//
// Stock was already deducted when:
//   COD  -> order placed
//   Stripe -> payment completed
//
// DELIVERED only changes order status.
// =========================================================

export async function updateOrderStatusController(
  request,
  response
) {
  try {
    const {
      orderId,
      status,
    } = request.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !orderId ||
      !status
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Order ID and status are required",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "PACKED",
      "SHIPPED",
      "DISPATCHED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Invalid order status",
      });
    }

    const cleanOrderId =
      String(orderId).trim();

    // -----------------------------------------------------
    // GET ORDERS
    // -----------------------------------------------------

    const orders =
      await prisma.order.findMany({
        where: {
          orderId:
            cleanOrderId,
        },
      });

    if (!orders.length) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "Order not found",
      });
    }

    // -----------------------------------------------------
    // CANCELLED ORDER
    // -----------------------------------------------------

    if (
      orders.some(
        (order) =>
          order.status ===
          "CANCELLED"
      ) &&
      status !== "CANCELLED"
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Cancelled order cannot be moved to another status",
      });
    }

    // -----------------------------------------------------
    // DELIVERED ORDER
    // -----------------------------------------------------

    if (
      orders.some(
        (order) =>
          order.status ===
          "DELIVERED"
      ) &&
      status !== "DELIVERED"
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Delivered order status cannot be changed",
      });
    }

    // -----------------------------------------------------
    // TIMESTAMPS
    // -----------------------------------------------------

    const timestampData = {};

    if (
      status ===
      "ACCEPTED"
    ) {
      timestampData.confirmedAt =
        new Date();
    }

    if (
      status ===
      "PACKED"
    ) {
      timestampData.packedAt =
        new Date();
    }

    if (
      status ===
      "SHIPPED"
    ) {
      timestampData.shippedAt =
        new Date();
    }

    if (
      status ===
      "DISPATCHED"
    ) {
      timestampData.dispatchedAt =
        new Date();
    }

    if (
      status ===
      "OUT_FOR_DELIVERY"
    ) {
      timestampData.outForDeliveryAt =
        new Date();
    }

    if (
      status ===
      "DELIVERED"
    ) {
      timestampData.deliveredAt =
        new Date();
    }

    // -----------------------------------------------------
    // UPDATE ORDER
    // -----------------------------------------------------

    const result =
      await prisma.order.updateMany({
        where: {
          orderId:
            cleanOrderId,
        },

        data: {
          status,

          ...timestampData,
        },
      });

    return response.json({
      success: true,
      error: false,

      message:
        status === "DELIVERED"
          ? "Order delivered successfully. Stock was already deducted when order was placed."
          : "Order status updated successfully",

      data:
        result,
    });

  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Failed to update order status",
    });
  }
}

// =========================================================
// ASSIGN DELIVERY PARTNER
// =========================================================

export async function assignDeliveryPartnerController(
  request,
  response
) {
  try {
    const {
      orderId,
      deliveryPartnerId,
    } = request.body;

    if (
      !orderId ||
      !deliveryPartnerId
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Order ID and delivery partner ID are required",
      });
    }

    const partner =
      await prisma.deliveryPartner.findUnique({
        where: {
          id:
            String(
              deliveryPartnerId
            ),
        },
      });

    if (!partner) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "Delivery partner not found",
      });
    }

    const cleanOrderId =
      String(orderId).trim();

    const orders =
      await prisma.order.findMany({
        where: {
          orderId:
            cleanOrderId,
        },
      });

    if (!orders.length) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "Order not found",
      });
    }

    const order =
      await prisma.order.updateMany({
        where: {
          orderId:
            cleanOrderId,
        },

        data: {
          deliveryPartnerId:
            String(
              deliveryPartnerId
            ),
        },
      });

    return response.json({
      success: true,
      error: false,

      message:
        "Delivery Partner Assigned",

      data:
        order,
    });

  } catch (error) {
    console.error(
      "ASSIGN DELIVERY PARTNER ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to assign delivery partner",
    });
  }
}

// =========================================================
// DELIVERY PARTNER ORDERS
// =========================================================

export async function getDeliveryOrdersController(
  request,
  response
) {
  try {
    const deliveryPartnerId =
      request.userId;

    if (!deliveryPartnerId) {
      return response.status(401).json({
        success: false,
        error: true,
        message:
          "Delivery partner not authenticated",
      });
    }

    const orders =
      await prisma.order.findMany({
        where: {
          deliveryPartnerId,
        },

        include: {
          product: true,
          delivery_address: true,
          user: true,
          deliveryPartner: true,
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return response.json({
      success: true,
      error: false,

      data:
        orders,
    });

  } catch (error) {
    console.error(
      "GET DELIVERY ORDERS ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to get delivery orders",
    });
  }
}

// =========================================================
// GET DELIVERY PARTNERS
// =========================================================

export async function getDeliveryPartnersController(
  request,
  response
) {
  try {
    const partners =
      await prisma.deliveryPartner.findMany({
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return response.json({
      success: true,
      error: false,

      data:
        partners,
    });

  } catch (error) {
    console.error(
      "GET DELIVERY PARTNERS ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to get delivery partners",
    });
  }
}

// =========================================================
// ADD DELIVERY PARTNER
// =========================================================

export async function addDeliveryPartnerController(
  request,
  response
) {
  try {
    const {
      employeeId,
      name,
      age,
      gender,
      mobile,
      email,
      password,
      address,
      photo,
    } = request.body;

    if (
      !employeeId ||
      !name ||
      !age ||
      !gender ||
      !mobile ||
      !email ||
      !password ||
      !address
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "All required delivery partner fields are required",
      });
    }

    const partner =
      await prisma.deliveryPartner.create({
        data: {
          employeeId,
          name,
          age:
            Number(age),
          gender,
          mobile,
          email,
          password,
          address,
          photo:
            photo || null,
        },
      });

    return response.json({
      success: true,
      error: false,

      data:
        partner,

      message:
        "Partner Added",
    });

  } catch (error) {
    console.error(
      "ADD DELIVERY PARTNER ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to add delivery partner",
    });
  }
}

// =========================================================
// ADMIN CANCEL ORDER
//
// IMPORTANT:
// If stock was deducted at order time,
// admin cancellation restores it.
// =========================================================

export async function adminCancelOrderController(
  request,
  response
) {
  try {
    const {
      orderId,
      reason,
    } = request.body;

    if (
      !orderId ||
      !reason
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Order ID and cancel reason required",
      });
    }

    const cleanOrderId =
      String(orderId).trim();

    // -----------------------------------------------------
    // GET ORDER
    // -----------------------------------------------------

    const orders =
      await prisma.order.findMany({
        where: {
          orderId:
            cleanOrderId,
        },
      });

    if (!orders.length) {
      return response.status(404).json({
        success: false,
        error: true,
        message:
          "Order not found",
      });
    }

    // -----------------------------------------------------
    // DELIVERED CANNOT CANCEL
    // -----------------------------------------------------

    if (
      orders.some(
        (order) =>
          order.status ===
          "DELIVERED"
      )
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Delivered order cannot be cancelled",
      });
    }

    // -----------------------------------------------------
    // ALREADY CANCELLED
    // -----------------------------------------------------

    if (
      orders.every(
        (order) =>
          order.status ===
          "CANCELLED"
      )
    ) {
      return response.status(400).json({
        success: false,
        error: true,
        message:
          "Order already cancelled",
      });
    }

    // -----------------------------------------------------
    // TRANSACTION
    // -----------------------------------------------------

    const updatedOrder =
      await prisma.$transaction(
        async (tx) => {

          // ---------------------------------------------
          // RESTORE STOCK
          // ---------------------------------------------

          for (
            const order
            of orders
          ) {

            if (
              order.stockDeducted
            ) {
              await restoreProductStock(
                tx,
                order.productId,
                Number(
                  order.quantity || 0
                )
              );

              await tx.order.update({
                where: {
                  id:
                    order.id,
                },

                data: {
                  stockDeducted:
                    false,
                },
              });
            }
          }

          // ---------------------------------------------
          // CANCEL ORDER
          // ---------------------------------------------

          return tx.order.updateMany({
            where: {
              orderId:
                cleanOrderId,
            },

            data: {
              status:
                "CANCELLED",

              cancelReason:
                reason,

              cancelledBy:
                "ADMIN",

              cancelledAt:
                new Date(),

              deliveryPartnerId:
                null,
            },
          });
        }
      );

    return response.json({
      success: true,
      error: false,

      message:
        "Order cancelled by admin and stock restored",

      data:
        updatedOrder,
    });

  } catch (error) {
    console.error(
      "ADMIN CANCEL ORDER ERROR:",
      error
    );

    return response.status(500).json({
      success: false,
      error: true,

      message:
        error?.message ||
        "Unable to cancel delivery",
    });
  }
}