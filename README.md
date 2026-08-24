# 🛒 NeoBasket

NeoBasket is a modern full-stack e-commerce platform designed to provide a complete online shopping experience with powerful admin, inventory, payment, order tracking, and delivery management features.

The project is built using **React.js, Node.js, Express.js, PostgreSQL, Prisma, Redux, Tailwind CSS, and Stripe**.

---

## 🚀 Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- User profile management
- Email verification support
- Forgot password / OTP support
- Multiple delivery addresses
- Product browsing
- Product details
- Product search
- Product categories and subcategories
- Add products to cart
- Update cart quantity
- Remove products from cart
- Stock availability checking
- Discounted product pricing
- Cash on Delivery
- Online payment using Stripe
- Order history
- Order cancellation
- Cancellation reason tracking
- Order tracking
- Delivery address management

---

## 🛍️ Product Management

NeoBasket provides complete product management functionality.

### Product Features

- Product name
- Product images
- Product price
- Product discount
- Product description
- Product stock
- Product quantity
- Product unit
- Manufacturing date
- Expiry date
- Product publishing/unpublishing
- Category management
- Subcategory management

### Inventory Management

Stock is automatically managed during the order lifecycle.

- Stock is deducted when a COD order is placed
- Stock is deducted after successful Stripe payment
- Products are automatically unpublished when stock reaches zero
- Stock is restored when an eligible order is cancelled
- Atomic stock updates help prevent negative inventory during concurrent orders

---

## 💳 Payment System

NeoBasket supports multiple payment methods.

### Cash on Delivery

For COD orders:

1. User selects products
2. Stock is checked
3. Stock is deducted immediately
4. Order is created
5. Cart is cleared
6. Order status starts as `PENDING`

### Stripe Payment

For online payments:

1. User selects products
2. Product stock is checked
3. Stripe Checkout Session is created
4. User completes payment
5. Stripe webhook confirms successful payment
6. Stock is deducted
7. Order is created
8. Cart is cleared

Stripe webhook handling is used to process successful payments securely.

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


### Image
<img width="1912" height="968" alt="image" src="https://github.com/user-attachments/assets/33024a8d-5198-47b9-be69-4727bd84907b" />

<img width="1912" height="966" alt="image" src="https://github.com/user-attachments/assets/3c1f814d-7185-48e6-ad05-6e9ee4dd2169" />
