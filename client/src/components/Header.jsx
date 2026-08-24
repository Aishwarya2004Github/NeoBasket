import React, { useState } from "react"
import logo from "../assets/logo.png"
import Search from "./Search"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaRegCircleUser } from "react-icons/fa6"
import useMobile from "../hooks/useMobile"
import { BsCart4 } from "react-icons/bs"
import { useSelector } from "react-redux"
import { GoTriangleDown, GoTriangleUp } from "react-icons/go"
import UserMenu from "./UserMenu"
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees"
import { useGlobalContext } from "../provider/GlobalProvider"
import DisplayCartItem from "./DisplayCartItem"

const Header = () => {
    const [isMobile] = useMobile()

    const location = useLocation()
    const navigate = useNavigate()

    const isSearchPage = location.pathname === "/search"

    const user = useSelector((state) => state?.user)

    const cartItem = useSelector(
        (state) => state?.cartItem?.cart
    )

    const { totalPrice, totalQty } = useGlobalContext()

    const [openUserMenu, setOpenUserMenu] = useState(false)
    const [openCartSection, setOpenCartSection] = useState(false)

    // =====================================================
    // ADMIN CHECK
    // =====================================================
    //
    // Supports:
    // isAdmin: true
    // isAdmin: "true"
    // role: "ADMIN"
    // role: "admin"
    // is_admin: true
    //
    const isAdmin =
        user?.isAdmin === true ||
        user?.isAdmin === "true" ||
        user?.is_admin === true ||
        user?.is_admin === "true" ||
        user?.role === "ADMIN" ||
        user?.role === "admin"

    // =====================================================
    // DEBUG
    // =====================================================
    //
    // Browser console me check karne ke liye:
    //
    // console.log("HEADER USER:", user)
    // console.log("HEADER IS ADMIN:", isAdmin)
    //

    // =====================================================
    // LOGIN
    // =====================================================

    const redirectToLoginPage = () => {
        navigate("/login")
    }

    // =====================================================
    // CLOSE USER MENU
    // =====================================================

    const handleCloseUserMenu = () => {
        setOpenUserMenu(false)
    }

    // =====================================================
    // MOBILE USER
    // =====================================================

    const handleMobileUser = () => {
        if (!user?._id) {
            navigate("/login")
            return
        }

        navigate("/user")
    }

    return (
        <header
            className="
                h-28 lg:h-20
                sticky top-0 z-50
                flex flex-col justify-center
                bg-slate-950/80
                backdrop-blur-xl
                border-b border-slate-900
                shadow-[0_4px_30px_rgba(0,0,0,0.5)]
                transition-all duration-300
            "
        >

            {/* =====================================================
                TOP LIQUID BORDER
            ===================================================== */}

            <div
                className="
                    absolute top-0 left-0 right-0
                    h-[2px]
                    bg-gradient-to-r
                    from-pink-500
                    via-cyan-400
                    via-yellow-400
                    to-purple-600
                    animate-[borderMarquee_4s_linear_infinite]
                "
                style={{
                    backgroundSize: "200% 200%"
                }}
            />

            {/* =====================================================
                DESKTOP / MAIN HEADER
            ===================================================== */}

            {!(isSearchPage && isMobile) && (
                <div
                    className="
                        container mx-auto
                        flex items-center
                        px-4
                        justify-between
                        gap-4
                    "
                >

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <div className="h-full flex items-center">

                        <Link
                            to="/"
                            className="
                                h-full
                                flex justify-center items-center
                                group relative
                            "
                        >

                            {/* Logo Glow */}

                            <div
                                className="
                                    absolute inset-0
                                    bg-cyan-500/10
                                    rounded-full
                                    blur-xl
                                    opacity-0
                                    group-hover:opacity-100
                                    transition-opacity duration-300
                                "
                            />

                            {/* Desktop Logo */}

                            <img
                                src={logo}
                                width={160}
                                height={55}
                                alt="logo"
                                className="
                                    hidden lg:block
                                    brightness-110
                                    contrast-105
                                    filter
                                    drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]
                                    group-hover:scale-102
                                    transition-transform duration-300
                                "
                            />

                            {/* Mobile Logo */}

                            <img
                                src={logo}
                                width={115}
                                height={50}
                                alt="logo"
                                className="
                                    lg:hidden
                                    brightness-110
                                    contrast-105
                                    filter
                                    drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]
                                "
                            />

                        </Link>

                    </div>

                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <div
                        className="
                            hidden lg:block
                            flex-1
                            max-w-xl
                            mx-4
                        "
                    >
                        <Search />
                    </div>

                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <div className="flex items-center gap-6">

                        {/* =================================================
                            MOBILE USER
                        ================================================= */}

                        <button
                            className="
                                text-slate-400
                                hover:text-pink-500
                                lg:hidden
                                p-2
                                rounded-xl
                                bg-slate-900/60
                                border border-slate-800
                                active:scale-90
                                transition-all duration-200
                                shadow-inner
                            "
                            onClick={handleMobileUser}
                        >
                            <FaRegCircleUser
                                size={24}
                                className="
                                    drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]
                                "
                            />
                        </button>

                        {/* =================================================
                            DESKTOP CONTROLS
                        ================================================= */}

                        <div
                            className="
                                hidden lg:flex
                                items-center
                                gap-8
                            "
                        >

                            {/* =================================================
                                ACCOUNT
                            ================================================= */}

                            {user?._id ? (

                                <div className="relative">

                                    <div
                                        onClick={() =>
                                            setOpenUserMenu(
                                                (prev) => !prev
                                            )
                                        }
                                        className="
                                            flex
                                            select-none
                                            items-center
                                            gap-1.5
                                            cursor-pointer
                                            font-bold
                                            text-slate-200
                                            hover:text-cyan-400
                                            transition-colors
                                            duration-200
                                            py-2
                                        "
                                    >

                                        <p
                                            className="
                                                tracking-wide
                                                text-sm
                                            "
                                        >
                                            Account
                                        </p>

                                        {openUserMenu ? (

                                            <GoTriangleUp
                                                size={20}
                                                className="
                                                    text-cyan-400
                                                    transition-transform
                                                    duration-300
                                                "
                                            />

                                        ) : (

                                            <GoTriangleDown
                                                size={20}
                                                className="
                                                    text-slate-400
                                                    transition-transform
                                                    duration-300
                                                "
                                            />

                                        )}

                                    </div>

                                    {openUserMenu && (

                                        <div
                                            className="
                                                absolute
                                                right-0
                                                top-12
                                                animate-in
                                                fade-in
                                                slide-in-from-top-3
                                                duration-200
                                                z-50
                                            "
                                        >

                                            <div
                                                className="
                                                    bg-slate-900
                                                    border
                                                    border-slate-800/80
                                                    rounded-2xl
                                                    p-4
                                                    min-w-56
                                                    shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                                                    backdrop-blur-xl
                                                    relative
                                                    before:absolute
                                                    before:w-3
                                                    before:h-3
                                                    before:bg-slate-900
                                                    before:border-t
                                                    before:border-l
                                                    before:border-slate-800/80
                                                    before:right-6
                                                    before:top-[-7px]
                                                    before:rotate-45
                                                "
                                            >

                                                <UserMenu
                                                    close={
                                                        handleCloseUserMenu
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <button
                                    onClick={
                                        redirectToLoginPage
                                    }
                                    className="
                                        text-sm
                                        font-black
                                        tracking-wider
                                        text-slate-200
                                        hover:text-pink-400
                                        transition-colors
                                        duration-200
                                        px-3
                                        py-1.5
                                    "
                                >
                                    Login
                                </button>

                            )}

                            {/* =================================================
                                AI SHOP
                            ================================================= */}

                            <Link
                                to="/ai"
                                className="
                                    hidden xl:flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-cyan-400/20
                                    bg-cyan-400/5
                                    px-3
                                    py-2
                                    text-xs
                                    font-black
                                    text-cyan-300
                                    hover:bg-cyan-400/10
                                    hover:border-cyan-400/40
                                    transition-all
                                "
                            >

                                <span
                                    className="
                                        grid
                                        h-6
                                        w-6
                                        place-items-center
                                        rounded-lg
                                        bg-gradient-to-br
                                        from-cyan-400
                                        to-violet-500
                                        text-slate-950
                                    "
                                >
                                    ✦
                                </span>

                                AI Shop

                            </Link>

                            {/* =================================================
                                ADMIN STOCK MANAGEMENT

                                URL:
                                /ai-features-admin
                            ================================================= */}

                            {isAdmin && (

                                <Link
                                    to="/ai-features-admin"
                                    className={`
                                        hidden xl:flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        border
                                        px-3
                                        py-2
                                        text-xs
                                        font-black
                                        transition-all
                                        ${
                                            location.pathname ===
                                            "/ai-features-admin"

                                                ? `
                                                    border-emerald-400/60
                                                    bg-emerald-400/20
                                                    text-emerald-300
                                                    shadow-[0_0_20px_rgba(16,185,129,0.25)]
                                                `

                                                : `
                                                    border-emerald-400/20
                                                    bg-emerald-400/5
                                                    text-emerald-300
                                                    hover:bg-emerald-400/10
                                                    hover:border-emerald-400/40
                                                    hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]
                                                `
                                        }
                                    `}
                                >

                                    <span
                                        className="
                                            grid
                                            h-6
                                            w-6
                                            place-items-center
                                            rounded-lg
                                            bg-gradient-to-br
                                            from-emerald-400
                                            to-green-500
                                            text-slate-950
                                            shadow-[0_0_10px_rgba(16,185,129,0.25)]
                                        "
                                    >
                                        📦
                                    </span>

                                    Stock

                                </Link>

                            )}

                            {/* =================================================
                                CART
                            ================================================= */}

                            <button
                                onClick={() =>
                                    setOpenCartSection(true)
                                }
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    bg-gradient-to-r
                                    ${
                                        cartItem?.length > 0
                                            ? `
                                                from-emerald-500
                                                to-green-600
                                                shadow-[0_0_20px_rgba(16,185,129,0.4)]
                                            `
                                            : `
                                                from-slate-900
                                                to-slate-800
                                                border
                                                border-slate-800
                                            `
                                    }
                                    hover:brightness-110
                                    active:scale-95
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    text-white
                                    font-black
                                    tracking-tight
                                    transition-all duration-300
                                    relative
                                    overflow-hidden
                                    group
                                `}
                            >

                                {/* Shiny flare */}

                                <div
                                    className="
                                        absolute inset-0
                                        bg-gradient-to-r
                                        from-transparent
                                        via-white/20
                                        to-transparent
                                        -translate-x-full
                                        group-hover:animate-[borderMarquee_1.5s_linear_infinite]
                                    "
                                    style={{
                                        backgroundSize: "200% 200%"
                                    }}
                                />

                                {/* Cart Icon */}

                                <div
                                    className={`
                                        ${
                                            cartItem?.length > 0
                                                ? "animate-bounce"
                                                : "group-hover:animate-pulse"
                                        }
                                        text-white
                                        filter
                                        drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                                    `}
                                >
                                    <BsCart4 size={24} />
                                </div>

                                {/* Cart Details */}

                                <div
                                    className="
                                        text-left
                                        border-l
                                        border-white/20
                                        pl-2.5
                                        min-w-[4.5rem]
                                    "
                                >

                                    {cartItem?.length > 0 ? (

                                        <div
                                            className="
                                                animate-in
                                                fade-in
                                                zoom-in-95
                                                duration-200
                                            "
                                        >

                                            <p
                                                className="
                                                    text-[10px]
                                                    uppercase
                                                    font-bold
                                                    text-emerald-100
                                                    opacity-90
                                                    tracking-wider
                                                "
                                            >
                                                {totalQty} Items
                                            </p>

                                            <p
                                                className="
                                                    text-xs
                                                    font-black
                                                    text-white
                                                    tracking-wide
                                                "
                                            >
                                                {
                                                    DisplayPriceInRupees(
                                                        totalPrice
                                                    )
                                                }
                                            </p>

                                        </div>

                                    ) : (

                                        <p
                                            className="
                                                text-xs
                                                font-bold
                                                text-slate-300
                                                group-hover:text-white
                                                transition-colors
                                                tracking-wide
                                                py-0.5
                                            "
                                        >
                                            My Cart
                                        </p>

                                    )}

                                </div>

                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                MOBILE SEARCH
            ===================================================== */}

            <div
                className="
                    container
                    mx-auto
                    px-4
                    pb-2
                    lg:hidden
                    w-full
                "
            >
                <Search />
            </div>

            {/* =====================================================
                CART DRAWER
            ===================================================== */}

            {openCartSection && (

                <DisplayCartItem
                    close={() =>
                        setOpenCartSection(false)
                    }
                />

            )}

        </header>
    )
}

export default Header