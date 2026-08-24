import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import path from "path"


// Routes
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import deliveryPartnerRouter from './route/deliveryPartner.route.js'


const app = express()


// ================= MIDDLEWARE =================


// CORS
app.use(
    cors({
        credentials:true,
        origin:process.env.FRONTEND_URL
    })
)


// Body parser
app.use(express.json())


// Cookie
app.use(cookieParser())


// Logger
app.use(morgan("dev"))


// Security
app.use(
    helmet({
        crossOriginResourcePolicy:false
    })
)


// ================= STATIC FILE =================


app.use(
    "/uploads",
    express.static(
        path.join(process.cwd(),"uploads")
    )
)


// ================= TEST ROUTE =================


app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:`Server is running on port ${process.env.PORT || 8080}`

    })

})



// ================= API ROUTES =================


app.use(
    "/api/user",
    userRouter
)


app.use(
    "/api/category",
    categoryRouter
)


app.use(
    "/api/file",
    uploadRouter
)


app.use(
    "/api/subcategory",
    subCategoryRouter
)


app.use(
    "/api/product",
    productRouter
)


app.use(
    "/api/cart",
    cartRouter
)


app.use(
    "/api/address",
    addressRouter
)


app.use(
    "/api/order",
    orderRouter
)


// DELIVERY PARTNER ROUTE

app.use(
    "/api/delivery-partner",
    deliveryPartnerRouter
)



// ================= SERVER =================


const PORT = process.env.PORT || 8080


app.listen(PORT,()=>{

    console.log(
        `Server is running on port ${PORT}`
    )

})