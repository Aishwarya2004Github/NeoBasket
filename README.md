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

## ✨ Image <img width="1912" height="968" alt="Screenshot 2026-08-24 224203" src="https://github.com/user-attachments/assets/f5619b53-d25a-4163-ba29-3bbb7f3b976e" />
<img width="1912" height="966" alt="Screenshot 2026-08-24 224254" src="https://github.com/user-attachments/assets/b1e8d469-e46e-4a76-9e86-9f61ba83f191" />
