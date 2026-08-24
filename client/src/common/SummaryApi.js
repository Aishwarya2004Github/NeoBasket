export const baseURL =
  "http://localhost:8080";

const SummaryApi = {
  // =====================================================
  // USER
  // =====================================================

  register: {
    url: "/api/user/register",
    method: "post"
  },

  login: {
    url: "/api/user/login",
    method: "post"
  },

  forgot_password: {
    url: "/api/user/forgot-password",
    method: "put"
  },

  forgot_password_otp_verification: {
    url: "/api/user/verify-forgot-password-otp",
    method: "put"
  },

  resetPassword: {
    url: "/api/user/reset-password",
    method: "put"
  },

  refreshToken: {
    url: "/api/user/refresh-token",
    method: "post"
  },

  userDetails: {
    url: "/api/user/user-details",
    method: "get"
  },

  logout: {
    url: "/api/user/logout",
    method: "get"
  },

  uploadAvatar: {
    url: "/api/user/upload-avatar",
    method: "put"
  },

  updateUserDetails: {
    url: "/api/user/update-user",
    method: "put"
  },

  // =====================================================
  // CATEGORY
  // =====================================================

  addCategory: {
    url: "/api/category/add-category",
    method: "post"
  },

  uploadImage: {
    url: "/api/file/upload",
    method: "post"
  },

  getCategory: {
    url: "/api/category/get",
    method: "get"
  },

  updateCategory: {
    url: "/api/category/update",
    method: "put"
  },

  deleteCategory: {
    url: "/api/category/delete",
    method: "delete"
  },

  // =====================================================
  // SUB CATEGORY
  // =====================================================

  createSubCategory: {
    url: "/api/subcategory/create",
    method: "post"
  },

  getSubCategory: {
    url: "/api/subcategory/get",
    method: "post"
  },

  updateSubCategory: {
    url: "/api/subcategory/update",
    method: "put"
  },

  deleteSubCategory: {
    url: "/api/subcategory/delete",
    method: "delete"
  },

  // =====================================================
  // PRODUCT
  // =====================================================

  createProduct: {
    url: "/api/product/create",
    method: "post"
  },

  getProduct: {
    url: "/api/product/get",
    method: "post"
  },

  getProductByCategory: {
    url: "/api/product/get-product-by-category",
    method: "post"
  },

  getProductByCategoryAndSubCategory: {
    url: "/api/product/get-product-by-category-and-subcategory",
    method: "post"
  },

  getProductDetails: {
    url: "/api/product/get-product-details",
    method: "post"
  },

  updateProductDetails: {
    url: "/api/product/update-product-details",
    method: "put"
  },

  deleteProduct: {
    url: "/api/product/delete-product",
    method: "delete"
  },

  searchProduct: {
    url: "/api/product/search-product",
    method: "post"
  },

  // =====================================================
  // CART
  // =====================================================

  addTocart: {
    url: "/api/cart/create",
    method: "post"
  },

  getCartItem: {
    url: "/api/cart/get",
    method: "get"
  },

  updateCartItemQty: {
    url: "/api/cart/update-qty",
    method: "put"
  },

  deleteCartItem: {
    url: "/api/cart/delete-cart-item",
    method: "delete"
  },

  // =====================================================
  // ADDRESS
  // =====================================================

  createAddress: {
    url: "/api/address/create",
    method: "post"
  },

  getAddress: {
    url: "/api/address/get",
    method: "get"
  },

  updateAddress: {
    url: "/api/address/update",
    method: "put"
  },

  disableAddress: {
    url: "/api/address/disable",
    method: "delete"
  },

  // =====================================================
  // ORDER
  // =====================================================

  CashOnDeliveryOrder: {
    url: "/api/order/cash-on-delivery",
    method: "post"
  },

  payment_url: {
    url: "/api/order/checkout",
    method: "post"
  },

  getOrderItems: {
    url: "/api/order/order-list",
    method: "get"
  },

  trackOrder: {
    url: "/api/order/track-order",
    method: "post"
  },

  adminOrders: {
    url: "/api/order/admin-order-list",
    method: "get"
  },

  updateOrderStatus: {
    url: "/api/order/update-status",
    method: "put"
  },

  assignDeliveryPartner: {
    url: "/api/order/assign-delivery",
    method: "put"
  },

  deliveryOrders: {
    url: "/api/order/delivery-orders",
    method: "get"
  },

  // =====================================================
  // DELIVERY PARTNER
  // =====================================================

  createDeliveryPartner: {
    url: "/api/delivery-partner/create",
    method: "post"
  },

  deliveryPartners: {
    url: "/api/delivery-partner/list",
    method: "get"
  },

  deleteDeliveryPartner: {
    url: "/api/delivery-partner/delete",
    method: "delete"
  },

  deliveryPartnerDetails: {
    url: "/api/delivery-partner/details",
    method: "get"
  },

  // =====================================================
  // AI SHOPPING COPILOT
  // =====================================================

  aiShoppingCopilot: {
    url: "http://localhost:8002/api/ai/copilot/shopping",
    method: "post"
  }
};

export default SummaryApi;