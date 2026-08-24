import { Outlet, useLocation } from "react-router-dom"
import "./App.css"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"

import fetchUserDetails from "./utils/fetchUserDetails"
import { setUserDetails } from "./store/userSlice"

import {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory
} from "./store/productSlice"

import { useDispatch } from "react-redux"
import Axios from "./utils/Axios"
import SummaryApi from "./common/SummaryApi"
import GlobalProvider from "./provider/GlobalProvider"
import CartMobileLink from "./components/CartMobile"

// 🤖 Shopping Robot
import ShoppingRobot from "./components/ShoppingRobot"


function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  // ---------------- USER ----------------
  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetails()

      if (userData?.data) {
        dispatch(setUserDetails(userData.data))
      }
    } catch (error) {
      console.log("User Error:", error)
    }
  }

  // ---------------- CATEGORY ----------------
  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true))

      const response = await Axios({
        ...SummaryApi.getCategory
      })

      const { data: responseData } = response

      if (responseData?.success) {
        const categories = responseData.data || []

        dispatch(
          setAllCategory(
            categories.sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          )
        )
      }
    } catch (error) {
      console.log("Category Error:", error)
    } finally {
      dispatch(setLoadingCategory(false))
    }
  }

  // ---------------- SUBCATEGORY ----------------
  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })

      const { data: responseData } = response

      if (responseData?.success) {
        const subCategories = responseData.data || []

        dispatch(
          setAllSubCategory(
            subCategories.sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          )
        )
      }
    } catch (error) {
      console.log("SubCategory Error:", error)
    }
  }

  // ---------------- INIT ----------------
  useEffect(() => {
    const init = async () => {
      await fetchUser()
      await fetchCategory()
      await fetchSubCategory()
    }

    init()
  }, [])

  return (
    <GlobalProvider>

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-[78vh]">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= TOASTER ================= */}
      <Toaster />

      {/* ================= MOBILE CART ================= */}
      {location.pathname !== "/checkout" && (
        <CartMobileLink />
      )}

      {/* ================= AI SHOPPING ROBOT ================= */}
      {location.pathname !== "/checkout" && (
        <ShoppingRobot />
      )}

    </GlobalProvider>
  )
}

export default App