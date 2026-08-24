import React from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import AddToCartButton from "./AddToCartButton";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import imageEmpty from "../assets/empty_cart.webp";
import toast from "react-hot-toast";

/* ============================================================
   GET CART ITEM ID
============================================================ */
const getCartItemId = (item = {}) => {
    return String(
        item?._id ||
        item?.id ||
        item?.cartItemId ||
        ""
    );
};

/* ============================================================
   GET PRODUCT OBJECT
============================================================ */
const getProductObject = (item = {}) => {
    if (
        item?.product &&
        typeof item.product === "object"
    ) {
        return item.product;
    }

    if (
        item?.productId &&
        typeof item.productId === "object"
    ) {
        return item.productId;
    }

    return {};
};

/* ============================================================
   GET PRODUCT ID
============================================================ */
const getProductId = (item = {}) => {
    const product = getProductObject(item);

    return String(
        product?._id ||
        product?.id ||
        (
            typeof item?.productId === "string"
                ? item.productId
                : ""
        ) ||
        item?.product_id ||
        ""
    );
};

/* ============================================================
   GET PRODUCT QUANTITY
============================================================ */
const getQuantity = (item = {}) => {
    const quantity =
        item?.quantity ??
        item?.qty ??
        item?.count ??
        1;

    const parsed = Number(quantity);

    if (
        !Number.isFinite(parsed) ||
        parsed < 0
    ) {
        return 0;
    }

    return parsed;
};

/* ============================================================
   GET LOT NUMBER

   Example:
   LOT-Grihasthi Multigrain Atta-002

   Returns:
   002
============================================================ */
const getLotNumber = (unit = "") => {
    if (!unit) {
        return "";
    }

    const value = String(unit).trim();

    if (
        value.toUpperCase().startsWith("LOT-")
    ) {
        const parts = value.split("-");

        if (parts.length >= 3) {
            return parts
                .slice(2)
                .join("-");
        }
    }

    return "";
};

/* ============================================================
   CHECK IF VALUE IS LOT VALUE
============================================================ */
const isLotValue = (value = "") => {
    if (!value) {
        return false;
    }

    return String(value)
        .trim()
        .toUpperCase()
        .startsWith("LOT-");
};

/* ============================================================
   GET QUANTITY UNIT

   Priority:

   quantityUnit
   unitType
   measureUnit
   measurementUnit
   quantity_unit
   productUnit

   If product.unit is "kg", use kg.

   If product.unit is LOT-..., don't use it as quantity unit.
============================================================ */
const getQuantityUnit = (
    product = {},
    item = {}
) => {

    const possibleUnits = [
        product?.quantityUnit,
        product?.unitType,
        product?.measureUnit,
        product?.measurementUnit,
        product?.quantity_unit,
        product?.productUnit,

        item?.quantityUnit,
        item?.unitType,
        item?.measureUnit,
        item?.measurementUnit,
        item?.quantity_unit,
        item?.productUnit,

        product?.unit,
        item?.unit,
    ];

    const foundUnit =
        possibleUnits.find(
            (value) => {

                if (
                    value === null ||
                    value === undefined
                ) {
                    return false;
                }

                const cleanValue =
                    String(value).trim();

                if (!cleanValue) {
                    return false;
                }

                /*
                 IMPORTANT:
                 LOT value ko quantity unit
                 nahi banana hai.
                */
                if (
                    isLotValue(cleanValue)
                ) {
                    return false;
                }

                return true;
            }
        );

    if (!foundUnit) {
        return "kg";
    }

    return String(foundUnit).trim();
};

/* ============================================================
   FORMAT QUANTITY

   Examples:

   1 + kg     => 1 kg
   2 + litre  => 2 litre
   1 + dozen  => 1 dozen
============================================================ */
const formatQuantity = (
    quantity,
    quantityUnit
) => {

    const numericQuantity =
        Number(quantity);

    if (
        !Number.isFinite(
            numericQuantity
        )
    ) {
        return `0 ${quantityUnit}`;
    }

    const displayQuantity =
        Number.isInteger(
            numericQuantity
        )
            ? numericQuantity
            : numericQuantity
                .toFixed(2)
                .replace(
                    /\.?0+$/,
                    ""
                );

    return `${displayQuantity} ${quantityUnit}`;
};

/* ============================================================
   COMPONENT
============================================================ */
const DisplayCartItem = ({ close }) => {

    const {
        notDiscountTotalPrice,
        totalPrice,
        totalQty,
    } = useGlobalContext();

    /* ========================================================
       CART DATA
    ======================================================== */
    const cartItem = useSelector(
        (state) =>
            state.cartItem?.cart || []
    );

    /* ========================================================
       USER
    ======================================================== */
    const user = useSelector(
        (state) => state.user
    );

    const navigate = useNavigate();

    /* ========================================================
       CHECKOUT
    ======================================================== */
    const redirectToCheckoutPage = () => {

        if (user?._id) {

            navigate("/checkout");

            if (close) {
                close();
            }

            return;
        }

        toast.error(
            "Please login to proceed with checkout"
        );
    };

    /* ========================================================
       RENDER
    ======================================================== */
    return (
        <section className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn">

            {/* ====================================================
                CART DRAWER
            ==================================================== */}
            <div className="bg-slate-900 border-l border-slate-800/80 w-full max-w-sm h-screen flex flex-col shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">

                {/* =================================================
                    HEADER
                ================================================= */}
                <div className="shrink-0 flex items-center p-4 bg-slate-950 border-b border-slate-800/60 shadow-sm gap-3 justify-between relative">

                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-pink-500" />

                    <h2 className="text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-wide uppercase flex items-center gap-2">
                        🛒 My Terminal Cart
                    </h2>

                    {/* MOBILE CLOSE */}
                    <Link
                        to="/"
                        onClick={close}
                        className="lg:hidden text-slate-400 hover:text-pink-500 p-1 rounded-xl hover:bg-slate-900 transition-colors"
                    >
                        <IoClose size={24} />
                    </Link>

                    {/* DESKTOP CLOSE */}
                    <button
                        type="button"
                        onClick={close}
                        className="hidden lg:block text-slate-400 hover:text-pink-500 p-1 rounded-xl hover:bg-slate-900 transition-colors active:scale-90"
                    >
                        <IoClose size={24} />
                    </button>

                </div>

                {/* =================================================
                    SCROLLABLE CART CONTENT
                ================================================= */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-slate-950/40 p-3 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                    {cartItem?.length > 0 ? (
                        <>

                            {/* =================================================
                                SAVINGS
                            ================================================= */}
                            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)]">

                                <p>
                                    Your total system savings
                                </p>

                                <p className="text-sm font-black">
                                    {DisplayPriceInRupees(
                                        Math.max(
                                            0,
                                            Number(
                                                notDiscountTotalPrice || 0
                                            ) -
                                            Number(
                                                totalPrice || 0
                                            )
                                        )
                                    )}
                                </p>

                            </div>

                            {/* =================================================
                                CART ITEMS
                            ================================================= */}
                            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 grid gap-4">

                                {cartItem.map(
                                    (item, index) => {

                                        /* =================================================
                                           PRODUCT
                                        ================================================= */
                                        const product =
                                            getProductObject(
                                                item
                                            );

                                        /* =================================================
                                           CART ITEM ID
                                        ================================================= */
                                        const cartId =
                                            getCartItemId(
                                                item
                                            );

                                        /* =================================================
                                           PRODUCT ID
                                        ================================================= */
                                        const productId =
                                            getProductId(
                                                item
                                            );

                                        /* =================================================
                                           QUANTITY
                                        ================================================= */
                                        const quantity =
                                            getQuantity(
                                                item
                                            );

                                        /* =================================================
                                           QUANTITY UNIT

                                           Example:
                                           kg
                                           litre
                                           dozen
                                        ================================================= */
                                        const quantityUnit =
                                            getQuantityUnit(
                                                product,
                                                item
                                            );

                                        /* =================================================
                                           FORMATTED QUANTITY

                                           Example:
                                           1 kg
                                           2 litre
                                           1 dozen
                                        ================================================= */
                                        const formattedQuantity =
                                            formatQuantity(
                                                quantity,
                                                quantityUnit
                                            );

                                        /* =================================================
                                           LOT
                                        ================================================= */
                                        const productUnit =
                                            product?.unit ||
                                            item?.unit ||
                                            "";

                                        const lotNumber =
                                            getLotNumber(
                                                productUnit
                                            );

                                        /* =================================================
                                           UNIQUE KEY
                                        ================================================= */
                                        const uniqueKey =
                                            cartId ||
                                            `${productId}-${index}`;

                                        /* =================================================
                                           IMAGE
                                        ================================================= */
                                        const image =
                                            Array.isArray(
                                                product?.image
                                            )
                                                ? product.image[0]
                                                : product?.image;

                                        const imageUrl =
                                            image
                                                ? (
                                                    image.startsWith(
                                                        "http://"
                                                    ) ||
                                                    image.startsWith(
                                                        "https://"
                                                    )
                                                        ? image
                                                        : `http://localhost:8080${image}`
                                                )
                                                : imageEmpty;

                                        /* =================================================
                                           PRODUCT NAME
                                        ================================================= */
                                        const productName =
                                            product?.name ||
                                            product?.productName ||
                                            product?.title ||
                                            "Product";

                                        /* =================================================
                                           PRODUCT PRICE

                                           Price is calculated ONLY
                                           for this cart item.
                                        ================================================= */
                                        const productPrice =
                                            pricewithDiscount(
                                                parseFloat(
                                                    product?.price ?? 0
                                                ),
                                                parseFloat(
                                                    product?.discount ?? 0
                                                )
                                            );

                                        /* =================================================
                                           ITEM TOTAL
                                        ================================================= */
                                        const itemTotal =
                                            productPrice *
                                            quantity;

                                        return (
                                            <div
                                                key={
                                                    uniqueKey
                                                }
                                                data-cart-id={
                                                    cartId
                                                }
                                                data-product-id={
                                                    productId
                                                }
                                                className="flex w-full gap-3 bg-slate-950/40 border border-slate-800/40 rounded-xl p-2.5 items-center justify-between hover:border-slate-800 transition-colors"
                                            >

                                                {/* =================================================
                                                    IMAGE
                                                ================================================= */}
                                                <div className="w-14 h-14 min-h-[56px] min-w-[56px] border border-slate-800 rounded-lg bg-slate-950 flex items-center justify-center p-1 overflow-hidden shrink-0">

                                                    <img
                                                        src={
                                                            imageUrl
                                                        }
                                                        alt={
                                                            productName
                                                        }
                                                        className="w-full h-full object-contain brightness-95"
                                                    />

                                                </div>

                                                {/* =================================================
                                                    PRODUCT INFO
                                                ================================================= */}
                                                <div className="flex-1 min-w-0 text-xs grid gap-0.5">

                                                    {/* PRODUCT NAME */}
                                                    <p className="line-clamp-2 font-bold text-slate-200 tracking-wide">
                                                        {
                                                            productName
                                                        }
                                                    </p>

                                                    {/* =================================================
                                                        LOT NUMBER

                                                        LOT ko quantity unit
                                                        ke saath mix nahi karenge.
                                                    ================================================= */}
                                                    {lotNumber && (
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                            Lot:{" "}
                                                            {
                                                                lotNumber
                                                            }
                                                        </p>
                                                    )}

                                                    {/* =================================================
                                                        PRICE

                                                        IMPORTANT:
                                                        Yahan sirf SINGLE PRICE
                                                        show hoga.
                                                    ================================================= */}
                                                    <p className="font-black text-slate-100 text-sm mt-1">
                                                        {DisplayPriceInRupees(
                                                            productPrice
                                                        )}
                                                    </p>

                                                    {/* =================================================
                                                        QUANTITY

                                                        Example:
                                                        Quantity: 1 kg
                                                        Quantity: 2 litre
                                                        Quantity: 1 dozen
                                                    ================================================= */}
                                                    <div className="flex items-center gap-2 mt-1">

                                                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                                                            Quantity:
                                                        </span>

                                                        <span className="inline-flex items-center justify-center min-h-[24px] px-2.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black">
                                                            {
                                                                formattedQuantity
                                                            }
                                                        </span>

                                                    </div>

                                                    {/* =================================================
                                                        ITEM TOTAL

                                                        Price × Quantity

                                                        Isko hide nahi kiya gaya hai,
                                                        lekin price duplicate na lage
                                                        isliye label ke saath compact rakha hai.
                                                    ================================================= */}
                                                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-800/50">

                                                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                                                            Item Total
                                                        </span>

                                                        <span className="text-xs font-black text-pink-400">
                                                            {DisplayPriceInRupees(
                                                                itemTotal
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* =================================================
                                                    ADD / REMOVE QUANTITY
                                                ================================================= */}
                                                <div
                                                    className="shrink-0 scale-90 origin-right"
                                                    data-cart-product-id={
                                                        productId
                                                    }
                                                    data-cart-item-id={
                                                        cartId
                                                    }
                                                >

                                                    <AddToCartButton
                                                        data={{
                                                            ...product,

                                                            _id:
                                                                product?._id ||
                                                                product?.id ||
                                                                productId,

                                                            id:
                                                                product?.id ||
                                                                product?._id ||
                                                                productId,

                                                            productId,

                                                            quantity,

                                                            qty:
                                                                quantity,

                                                            cartItemId:
                                                                cartId,

                                                            cartItem_Id:
                                                                cartId,

                                                            cartItemIdFromCart:
                                                                cartId,

                                                            quantityUnit:
                                                                quantityUnit,

                                                            unitType:
                                                                quantityUnit,
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                            {/* =================================================
                                INVOICE
                            ================================================= */}
                            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-xs tracking-wide font-medium text-slate-400 grid gap-2.5 shadow-md">

                                <h3 className="font-black text-slate-200 uppercase tracking-widest border-b border-slate-800/60 pb-1.5 text-[11px] mb-0.5">
                                    🧾 System Invoice Details
                                </h3>

                                {/* =================================================
                                    ITEMS TOTAL

                                    Yahan price sirf ONE TIME show hoga.
                                ================================================= */}
                                <div className="flex justify-between items-center px-1">

                                    <p>
                                        Items Total
                                    </p>

                                    <p className="font-black text-slate-200">
                                        {DisplayPriceInRupees(
                                            totalPrice
                                        )}
                                    </p>

                                </div>

                                {/* =================================================
                                    TOTAL SAVINGS
                                ================================================= */}
                                <div className="flex justify-between items-center px-1">

                                    <p>
                                        Total Savings
                                    </p>

                                    <p className="font-bold text-cyan-400">
                                        {DisplayPriceInRupees(
                                            Math.max(
                                                0,
                                                Number(
                                                    notDiscountTotalPrice || 0
                                                ) -
                                                Number(
                                                    totalPrice || 0
                                                )
                                            )
                                        )}
                                    </p>

                                </div>

                                {/* =================================================
                                    TOTAL QUANTITY
                                ================================================= */}
                                <div className="flex justify-between items-center px-1">

                                    <p>
                                        Quantity Capacity
                                    </p>

                                    <p className="font-bold text-slate-200">
                                        {totalQty}{" "}
                                        {Number(totalQty) === 1
                                            ? "item"
                                            : "items"}
                                    </p>

                                </div>

                                {/* =================================================
                                    DELIVERY
                                ================================================= */}
                                <div className="flex justify-between items-center px-1">

                                    <p>
                                        Network Delivery Fee
                                    </p>

                                    <p className="font-black text-cyan-400 uppercase tracking-widest text-[10px] bg-cyan-500/10 px-1.5 py-0.5 border border-cyan-500/20 rounded-md">
                                        Free
                                    </p>

                                </div>

                                {/* =================================================
                                    GRAND TOTAL

                                    Same total ko yahan final payable
                                    ke roop me sirf ek baar dikhaya gaya hai.
                                ================================================= */}
                                <div className="font-black text-sm flex items-center justify-between border-t border-slate-800/60 pt-2.5 mt-1 text-slate-100">

                                    <p className="uppercase tracking-wider text-xs font-bold text-slate-400">
                                        Grand Total
                                    </p>

                                    <p className="text-base font-black text-white">
                                        {DisplayPriceInRupees(
                                            totalPrice
                                        )}
                                    </p>

                                </div>

                            </div>

                        </>
                    ) : (

                        /* =====================================================
                           EMPTY CART
                        ===================================================== */
                        <div className="bg-transparent py-16 flex flex-col justify-center items-center gap-6 flex-grow">

                            <img
                                src={
                                    imageEmpty
                                }
                                alt="Empty cart"
                                className="w-48 h-48 object-contain opacity-40 mix-blend-screen"
                            />

                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center max-w-[200px] leading-relaxed">
                                Your secure checkout buffer matrix is completely empty
                            </p>

                            <Link
                                onClick={
                                    close
                                }
                                to="/"
                                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_25px_rgba(244,63,94,0.5)] transition-all duration-300 active:scale-95"
                            >
                                Initialize Shopping
                            </Link>

                        </div>
                    )}

                </div>

                {/* =================================================
                    CHECKOUT FOOTER
                ================================================= */}
                {cartItem?.length > 0 && (

                    <div className="shrink-0 p-3 bg-slate-950 border-t border-slate-800/60">

                        <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800/80 text-white px-4 py-3.5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">

                            {/* PAYABLE */}
                            <div className="grid gap-0.5">

                                <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">
                                    Payable Amount
                                </p>

                                <div className="text-base font-black text-white tracking-wide">
                                    {DisplayPriceInRupees(
                                        totalPrice
                                    )}
                                </div>

                            </div>

                            {/* CHECKOUT BUTTON */}
                            <button
                                type="button"
                                onClick={
                                    redirectToCheckoutPage
                                }
                                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 font-black text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center gap-1 transition-all duration-200 active:scale-95 shadow-[0_4px_15px_rgba(244,63,94,0.25)]"
                            >

                                <span>
                                    Proceed
                                </span>

                                <FaCaretRight
                                    size={14}
                                    className="mt-[1px]"
                                />

                            </button>

                        </div>

                    </div>
                )}

            </div>

        </section>
    );
};

export default DisplayCartItem;