import { createBrowserRouter } from "react-router-dom";

import App from "../App";

import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";

import UserMenuMobile from "../pages/UserMenuMobile";

import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Address from "../pages/Address";

import CategoryPage from "../pages/CategoryPage";
import SubCategoryPage from "../pages/SubCategoryPage";
import UploadProduct from "../pages/UploadProduct";
import ProductAdmin from "../pages/ProductAdmin";

import AdminPermision from "../layouts/AdminPermision";

import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";

import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";

import Success from "../pages/Success";
import Cancel from "../pages/Cancel";

import AdminOrderDetails from "../pages/AdminOrderDetails";
import OrderTracking from "../pages/OrderTracking";

import AddDeliveryPartner from "../pages/AddDeliveryPartner";
import DeliveryPartners from "../pages/DeliveryPartners";
import DeliveryPartnerDetails from "../pages/DeliveryPartnerDetails";

import AIFeatures from "../pages/AIFeatures";

/*
=========================================================
AI SHOPPING
=========================================================
*/
import AIShopping from "../pages/AIShopping";

/*
=========================================================
ADMIN AI / STOCK MANAGEMENT
=========================================================
*/
import AIFeaturesAdmin from "../pages/AIFeaturesAdmin";


const router = createBrowserRouter([

    {
        path: "/",

        element: <App />,

        children: [

            // =====================================================
            // HOME
            // =====================================================

            {
                path: "",
                element: <Home />
            },


            // =====================================================
            // SEARCH
            // =====================================================

            {
                path: "search",
                element: <SearchPage />
            },


            // =====================================================
            // AI FEATURES
            // =====================================================

            {
                path: "ai",
                element: <AIFeatures />
            },


            // =====================================================
            // AI SHOPPING ASSISTANT
            //
            // URL:
            // http://localhost:5173/ai-shopping
            //
            // NO API KEY REQUIRED
            // =====================================================

            {
                path: "ai-shopping",
                element: <AIShopping />
            },


            // =====================================================
            // ADMIN STOCK MANAGEMENT
            //
            // URL:
            // http://localhost:5173/ai-features-admin
            //
            // ONLY ADMIN
            // =====================================================

            {
                path: "ai-features-admin",

                element:

                    <AdminPermision>
                        <AIFeaturesAdmin />
                    </AdminPermision>

            },


            // =====================================================
            // AUTH
            // =====================================================

            {
                path: "login",
                element: <Login />
            },


            {
                path: "register",
                element: <Register />
            },


            {
                path: "forgot-password",
                element: <ForgotPassword />
            },


            {
                path: "verification-otp",
                element: <OtpVerification />
            },


            {
                path: "reset-password",
                element: <ResetPassword />
            },


            // =====================================================
            // USER
            // =====================================================

            {
                path: "user",
                element: <UserMenuMobile />
            },


            // =====================================================
            // DASHBOARD
            // =====================================================

            {
                path: "dashboard",

                element: <Dashboard />,

                children: [

                    // =================================================
                    // PROFILE
                    // =================================================

                    {
                        path: "profile",
                        element: <Profile />
                    },


                    // =================================================
                    // MY ORDERS
                    // =================================================

                    {
                        path: "myorders",
                        element: <MyOrders />
                    },


                    // =================================================
                    // ADDRESS
                    // =================================================

                    {
                        path: "address",
                        element: <Address />
                    },


                    // =================================================
                    // ADMIN CATEGORY
                    // =================================================

                    {
                        path: "category",

                        element:

                            <AdminPermision>
                                <CategoryPage />
                            </AdminPermision>

                    },


                    // =================================================
                    // ADMIN SUBCATEGORY
                    // =================================================

                    {
                        path: "subcategory",

                        element:

                            <AdminPermision>
                                <SubCategoryPage />
                            </AdminPermision>

                    },


                    // =================================================
                    // ADMIN UPLOAD PRODUCT
                    // =================================================

                    {
                        path: "upload-product",

                        element:

                            <AdminPermision>
                                <UploadProduct />
                            </AdminPermision>

                    },


                    // =================================================
                    // ADMIN PRODUCT
                    // =================================================

                    {
                        path: "product",

                        element:

                            <AdminPermision>
                                <ProductAdmin />
                            </AdminPermision>

                    },


                    // =================================================
                    // ADD DELIVERY PARTNER
                    // =================================================

                    {
                        path: "add-delivery-partner",

                        element:

                            <AdminPermision>
                                <AddDeliveryPartner />
                            </AdminPermision>

                    },


                    // =================================================
                    // ALL DELIVERY PARTNERS
                    // =================================================

                    {
                        path: "delivery-partners",

                        element:

                            <AdminPermision>
                                <DeliveryPartners />
                            </AdminPermision>

                    },


                    // =================================================
                    // DELIVERY PARTNER DETAILS
                    // =================================================

                    {
                        path: "delivery-partner/:id",

                        element:

                            <AdminPermision>
                                <DeliveryPartnerDetails />
                            </AdminPermision>

                    },


                    // =================================================
                    // ORDER TRACKING
                    // =================================================

                    {
                        path: "order-tracking",

                        element: <OrderTracking />

                    }

                ]

            },


            // =====================================================
            // PRODUCT CATEGORY
            // =====================================================

            {
                path: ":category",

                children: [

                    {
                        path: ":subCategory",

                        element: <ProductListPage />

                    }

                ]

            },


            // =====================================================
            // PRODUCT DETAILS
            // =====================================================

            {
                path: "product/:product",

                element: <ProductDisplayPage />

            },


            // =====================================================
            // CART
            // =====================================================

            {
                path: "cart",

                element: <CartMobile />

            },


            // =====================================================
            // CHECKOUT
            // =====================================================

            {
                path: "checkout",

                element: <CheckoutPage />

            },


            // =====================================================
            // SUCCESS
            // =====================================================

            {
                path: "success",

                element: <Success />

            },


            // =====================================================
            // CANCEL
            // =====================================================

            {
                path: "cancel",

                element: <Cancel />

            },


            // =====================================================
            // ADMIN ORDER DETAILS
            // =====================================================

            {
                path: "admin/order-details/:orderId",

                element: <AdminOrderDetails />

            }

        ]

    }

]);


export default router;