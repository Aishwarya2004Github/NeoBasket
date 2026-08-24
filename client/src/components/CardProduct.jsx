import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "./AddToCartButton";

const CardProduct = ({ data }) => {
  // ---------------------------------------------
  // UNIQUE PRODUCT ID
  // ---------------------------------------------
  const productId = data?.id || data?._id;

  // ---------------------------------------------
  // PRODUCT URL
  // ---------------------------------------------
  const url = `/product/${valideURLConvert(data?.name)}-${productId}`;

  // ---------------------------------------------
  // PRODUCT IMAGE
  // ---------------------------------------------
  const getProductImage = () => {
    if (!data?.image?.[0]) return "";

    return data.image[0].startsWith("http")
      ? data.image[0]
      : `http://localhost:8080${data.image[0]}`;
  };

  return (
    <Link
      to={url}
      className="
        group
        border border-slate-800/60
        py-3 px-3 lg:p-4
        grid gap-2 lg:gap-3
        min-w-[150px] lg:min-w-[220px]
        rounded-2xl
        cursor-pointer
        bg-slate-900/80
        shadow-md
        hover:shadow-[0_0_25px_rgba(34,211,238,0.1)]
        hover:border-slate-700/80
        transition-all
        duration-300
        relative
        overflow-hidden
        flex
        flex-col
        justify-between
      "
    >
      {/* ---------------------------------------------
          TOP NEON BORDER
      --------------------------------------------- */}
      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-[2px]
          bg-gradient-to-r
          from-transparent
          via-cyan-500/40
          to-transparent
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-300
        "
      />

      {/* ---------------------------------------------
          PRODUCT IMAGE
      --------------------------------------------- */}
      <div
        className="
          min-h-[110px]
          max-h-[110px]
          lg:min-h-[140px]
          lg:max-h-[140px]
          w-full
          rounded-xl
          overflow-hidden
          bg-slate-950/40
          border
          border-slate-800/40
          flex
          items-center
          justify-center
          relative
          p-1
        "
      >
        <img
          src={getProductImage()}
          alt={data?.name || "Product"}
          className="
            w-full
            h-full
            object-scale-down
            lg:scale-110
            group-hover:scale-125
            transition-transform
            duration-300
          "
          loading="lazy"
        />

        {/* OUT OF STOCK */}
        {Number(data?.stock) === 0 && (
          <div
            className="
              absolute
              inset-0
              bg-slate-950/80
              backdrop-blur-[2px]
              flex
              items-center
              justify-center
              p-2
            "
          >
            <span
              className="
                text-[10px]
                lg:text-xs
                font-black
                tracking-widest
                text-rose-500
                bg-rose-500/10
                border
                border-rose-500/30
                px-2.5
                py-1
                rounded-md
                uppercase
              "
            >
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* ---------------------------------------------
          BADGES
      --------------------------------------------- */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        {/* DELIVERY */}
        <div
          className="
            rounded-md
            text-[10px]
            font-black
            uppercase
            tracking-wider
            px-2
            py-0.5
            text-cyan-400
            bg-cyan-500/10
            border
            border-cyan-500/20
          "
        >
          10 min
        </div>

        {/* DISCOUNT */}
        {Boolean(data?.discount) && (
          <div
            className="
              text-pink-400
              bg-pink-500/10
              border
              border-pink-500/20
              px-2
              py-0.5
              text-[10px]
              font-black
              uppercase
              tracking-wider
              rounded-md
              animate-pulse
            "
          >
            {data.discount}% OFF
          </div>
        )}
      </div>

      {/* ---------------------------------------------
          PRODUCT INFORMATION
      --------------------------------------------- */}
      <div className="grid gap-1 flex-grow">
        <h3
          className="
            px-1
            lg:px-0
            font-bold
            text-slate-200
            text-ellipsis
            text-sm
            lg:text-base
            line-clamp-2
            tracking-wide
            group-hover:text-white
            transition-colors
            duration-200
          "
        >
          {data?.name}
        </h3>

        <p
          className="
            w-fit
            px-1
            lg:px-0
            text-xs
            font-bold
            text-slate-500
            uppercase
            tracking-wider
          "
        >
          {data?.unit || "N/A"}
        </p>
      </div>

      {/* ---------------------------------------------
          PRICE + CART
      --------------------------------------------- */}
      <div
        className="
          px-1
          lg:px-0
          flex
          items-center
          justify-between
          gap-2
          text-sm
          lg:text-base
          pt-1
          border-t
          border-slate-800/40
          mt-1
        "
      >
        {/* PRICE */}
        <div className="flex items-center gap-1">
          <span
            className="
              font-black
              text-slate-100
              text-base
              lg:text-lg
              tracking-wide
            "
          >
            {DisplayPriceInRupees(
              pricewithDiscount(data?.price, data?.discount)
            )}
          </span>
        </div>

        {/* CART BUTTON */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {Number(data?.stock) === 0 ? (
            <p
              className="
                text-rose-500
                text-xs
                font-black
                uppercase
                tracking-widest
                px-2
                py-1.5
                border
                border-rose-500/20
                bg-rose-500/5
                rounded-xl
                cursor-not-allowed
              "
            >
              Ended
            </p>
          ) : (
            <AddToCartButton
              data={data}
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;