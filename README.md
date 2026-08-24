# Image 
<img width="1912" height="968" alt="Screenshot 2026-08-24 224203" src="https://github.com/user-attachments/assets/89e685ca-d7ae-40a7-aa47-c73b3978a9fc" />
<img width="1912" height="966" alt="Screenshot 2026-08-24 224254" src="https://github.com/user-attachments/assets/9df7104d-f7d6-4ae3-82d8-3213f964e55b" />

# 🛒 NeoBasket

NeoBasket is a modern **full-stack e-commerce platform** designed to provide a complete online shopping experience with product management, inventory control, secure payments, order management, order tracking, and delivery partner management.

The project is built using **React.js, Node.js, Express.js, PostgreSQL, Prisma, Redux, Tailwind CSS, and Stripe**.

---

## ✨ Features

### 👤 User Features

- 🔐 User registration and login
- 🔑 JWT-based authentication
- 👤 User profile management
- 📧 Email verification support
- 🔄 Forgot password / OTP support
- 📍 Multiple delivery addresses
- 🔎 Product search
- 🛍️ Product browsing
- 📦 Product details
- 🗂️ Categories and subcategories
- 🛒 Add products to cart
- ➕ Update cart quantity
- ❌ Remove products from cart
- 📊 Stock availability checking
- 💰 Discounted product pricing
- 💵 Cash on Delivery
- 💳 Stripe online payment
- 📋 Order history
- ❌ Order cancellation
- 📝 Cancellation reason tracking
- 🚚 Order tracking
- 📍 Delivery address management

---

## 🛍️ Product Management

NeoBasket provides complete product and inventory management.

### Product Features

- Product name
- Multiple product images
- Product price
- Product discount
- Product description
- Product stock
- Product quantity
- Product unit
- Manufacturing date
- Expiry date
- Publish / unpublish products
- Category management
- Subcategory management

### 📦 Inventory Management

Stock is automatically managed throughout the order lifecycle.

- Stock is deducted immediately for COD orders
- Stock is deducted after successful Stripe payment
- Products are automatically unpublished when stock reaches `0`
- Stock is restored when an eligible order is cancelled
- Atomic stock updates help prevent negative inventory
- Concurrent orders are handled safely using database transactions

---

## 💳 Payment System

NeoBasket supports multiple payment methods.

### 💵 Cash on Delivery

For COD orders:

1. User selects products
2. Product stock is checked
3. Stock is deducted immediately
4. Order is created
5. Cart is cleared
6. Order status starts as `PENDING`

### 💳 Stripe Payment

For online payments:

1. User selects products
2. Product stock is checked
3. Stripe Checkout Session is created
4. User completes payment
5. Stripe webhook confirms the payment
6. Stock is deducted
7. Order is created
8. Cart is cleared

Stripe Webhooks are used to process successful payments securely.

---

## 📦 Order Management

NeoBasket provides complete order lifecycle management.

### Order Status

```text
PENDING
ACCEPTED
PACKED
SHIPPED
DISPATCHED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED

