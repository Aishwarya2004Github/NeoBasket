import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { aiApi } from "../ai/aiEngine";
import { addToCartProduct } from "../utils/addToCartProduct";
import AxiosToastError from "../utils/AxiosToastError";
import { useGlobalContext } from "../provider/GlobalProvider";
import { useSelector } from "react-redux";

/* ========================================================================
   BACKEND
======================================================================== */

/*
 * IMPORTANT
 *
 * Backend:
 * http://localhost:8080
 *
 * Agar image:
 *
 * /uploads/product.jpg
 *
 * hai to final URL:
 *
 * http://localhost:8080/uploads/product.jpg
 *
 * Agar already:
 *
 * http://localhost:8080/uploads/product.jpg
 *
 * hai to same URL use hoga.
 */

const BACKEND_URL = "http://localhost:8080";

const resolveImageUrl = (value) => {
  if (!value) {
    return "";
  }

  /*
   * Object image
   */
  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const objectValue =
      value?.url ||
      value?.imageUrl ||
      value?.image_url ||
      value?.src ||
      value?.secure_url ||
      value?.path ||
      value?.thumbnail ||
      value?.thumbnailUrl ||
      value?.thumbnail_url ||
      "";

    if (!objectValue) {
      return "";
    }

    return resolveImageUrl(
      objectValue
    );
  }

  /*
   * Array image
   */
  if (
    Array.isArray(value)
  ) {
    for (
      const item of value
    ) {
      const result =
        resolveImageUrl(
          item
        );

      if (result) {
        return result;
      }
    }

    return "";
  }

  if (
    typeof value !== "string"
  ) {
    return "";
  }

  let image =
    value.trim();

  if (!image) {
    return "";
  }

  /*
   * Remove accidental quotes.
   */
  image =
    image.replace(
      /^["']|["']$/g,
      ""
    );

  /*
   * Already absolute URL.
   */
  if (
    /^https?:\/\//i.test(
      image
    )
  ) {
    return image;
  }

  /*
   * Protocol-relative URL.
   *
   * //cdn.example.com/image.jpg
   */
  if (
    image.startsWith("//")
  ) {
    return `http:${image}`;
  }

  /*
   * data/blob images.
   */
  if (
    image.startsWith(
      "data:"
    ) ||
    image.startsWith(
      "blob:"
    )
  ) {
    return image;
  }

  /*
   * Remove localhost backend duplication.
   *
   * Example:
   *
   * http://localhost:8080http://localhost:8080/image
   */
  image =
    image.replace(
      /^http:\/\/localhost:8080/i,
      ""
    );

  /*
   * Relative backend image.
   *
   * /uploads/image.jpg
   */
  if (
    image.startsWith("/")
  ) {
    return `${BACKEND_URL}${image}`;
  }

  /*
   * Relative path without slash.
   *
   * uploads/image.jpg
   */
  return `${BACKEND_URL}/${image}`;
};

/* ========================================================================
   IMAGE EXTRACTOR
======================================================================== */

const extractImage = (
  value
) => {
  if (!value) {
    return "";
  }

  /*
   * Direct string.
   */
  if (
    typeof value === "string"
  ) {
    return resolveImageUrl(
      value
    );
  }

  /*
   * Array.
   */
  if (
    Array.isArray(value)
  ) {
    for (
      const item of value
    ) {
      const result =
        extractImage(
          item
        );

      if (result) {
        return result;
      }
    }

    return "";
  }

  /*
   * Object.
   */
  if (
    typeof value === "object"
  ) {
    const direct =
      value?.url ||
      value?.imageUrl ||
      value?.image_url ||
      value?.src ||
      value?.secure_url ||
      value?.path ||
      value?.thumbnail ||
      value?.thumbnailUrl ||
      value?.thumbnail_url;

    if (direct) {
      const result =
        resolveImageUrl(
          direct
        );

      if (result) {
        return result;
      }
    }

    /*
     * Some APIs return:
     *
     * {
     *   image: {
     *      url: "/uploads/x.jpg"
     *   }
     * }
     */
    const nestedKeys = [
      "image",
      "images",
      "thumbnail",
      "productImage",
      "product_image",
      "imageData",
      "data",
    ];

    for (
      const key of nestedKeys
    ) {
      const result =
        extractImage(
          value?.[key]
        );

      if (result) {
        return result;
      }
    }
  }

  return "";
};

/* ========================================================================
   PRODUCT IMAGE
======================================================================== */

const getProductImage = (
  product = {}
) => {
  if (!product) {
    return "";
  }

  /*
   * Direct candidates.
   */
  const candidates = [
    product?.image,
    product?.imageUrl,
    product?.image_url,
    product?.thumbnail,
    product?.thumbnailUrl,
    product?.thumbnail_url,
    product?.productImage,
    product?.product_image,
    product?.images,

    product?.product?.image,
    product?.product?.imageUrl,
    product?.product?.image_url,
    product?.product?.thumbnail,
    product?.product?.thumbnailUrl,
    product?.product?.images,

    product?.productDetails?.image,
    product?.productDetails?.imageUrl,
    product?.productDetails?.image_url,
    product?.productDetails?.thumbnail,
    product?.productDetails?.thumbnailUrl,
    product?.productDetails?.images,

    product?.productData?.image,
    product?.productData?.imageUrl,
    product?.productData?.image_url,
    product?.productData?.thumbnail,
    product?.productData?.thumbnailUrl,
    product?.productData?.images,

    product?.item?.image,
    product?.item?.imageUrl,
    product?.item?.image_url,
    product?.item?.thumbnail,
    product?.item?.images,

    product?.data?.image,
    product?.data?.imageUrl,
    product?.data?.image_url,
    product?.data?.thumbnail,
    product?.data?.thumbnailUrl,
    product?.data?.images,

    product?.variant?.image,
    product?.variant?.imageUrl,
    product?.variant?.image_url,
    product?.variant?.thumbnail,
    product?.variant?.images,

    product?.variants,
  ];

  for (
    const candidate of candidates
  ) {
    const image =
      extractImage(
        candidate
      );

    if (image) {
      return image;
    }
  }

  /*
   * Deep fallback.
   */
  const visited =
    new Set();

  const findImage = (
    value,
    depth = 0
  ) => {
    if (
      depth > 8 ||
      value === null ||
      value === undefined
    ) {
      return "";
    }

    if (
      typeof value === "string"
    ) {
      return resolveImageUrl(
        value
      );
    }

    if (
      typeof value !== "object"
    ) {
      return "";
    }

    if (
      visited.has(value)
    ) {
      return "";
    }

    visited.add(value);

    const imageKeys = [
      "image",
      "imageUrl",
      "image_url",
      "thumbnail",
      "thumbnailUrl",
      "thumbnail_url",
      "productImage",
      "product_image",
      "src",
      "url",
      "secure_url",
      "path",
    ];

    for (
      const key of imageKeys
    ) {
      if (
        value?.[key]
      ) {
        const result =
          extractImage(
            value[key]
          );

        if (result) {
          return result;
        }
      }
    }

    if (
      Array.isArray(value)
    ) {
      for (
        const child of value
      ) {
        const result =
          findImage(
            child,
            depth + 1
          );

        if (result) {
          return result;
        }
      }

      return "";
    }

    for (
      const key of Object.keys(
        value
      )
    ) {
      const child =
        value[key];

      if (
        child &&
        typeof child ===
          "object"
      ) {
        const result =
          findImage(
            child,
            depth + 1
          );

        if (result) {
          return result;
        }
      }
    }

    return "";
  };

  return findImage(
    product
  );
};

/* ========================================================================
   IMAGE COMPONENT
======================================================================== */

const ImageWithFallback = ({
  src,
  alt = "",
  className = "",
  fallbackClassName = "",
  fallback = "🛒",
}) => {
  const resolvedSrc =
    useMemo(
      () =>
        resolveImageUrl(
          src
        ),
      [src]
    );

  const [
    imageError,
    setImageError,
  ] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [
    resolvedSrc,
  ]);

  if (
    !resolvedSrc ||
    imageError
  ) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-900 border border-zinc-800 text-emerald-400 rounded-2xl shadow-inner transition-all duration-300 ${fallbackClassName}`}
      >
        <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`object-cover rounded-xl transition-all duration-300 hover:scale-105 ${className}`}
      loading="lazy"
      decoding="async"
      onError={() =>
        setImageError(
          true
        )
      }
    />
  );
};

/* ========================================================================
   PRICE
======================================================================== */

const formatPrice = (
  value
) => {
  const number =
    Number(
      value || 0
    );

  return `₹${number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  )}`;
};

/* ========================================================================
   NUMBER
======================================================================== */

const toPositiveNumber = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (
    typeof value === "object"
  ) {
    return 0;
  }

  const cleaned =
    String(value)
      .replace(/₹/g, "")
      .replace(/Rs\.?/gi, "")
      .replace(/INR/gi, "")
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .trim();

  const number =
    Number(
      cleaned
    );

  if (
    !Number.isFinite(
      number
    ) ||
    number <= 0
  ) {
    return 0;
  }

  return number;
};

/* ========================================================================
   PRODUCT ID
======================================================================== */

const getProductId = (
  product = {}
) => {
  if (
    typeof product ===
      "string" ||
    typeof product ===
      "number"
  ) {
    return String(
      product
    );
  }

  const id =
    product?.productId ??
    product?.product_id ??
    product?._id ??
    product?.id ??
    product?.product?._id ??
    product?.product?.id ??
    product?.product?.productId ??
    product?.product?.product_id ??
    product?.productDetails?._id ??
    product?.productDetails?.id ??
    product?.productDetails?.productId ??
    product?.productData?._id ??
    product?.productData?.id ??
    product?.productData?.productId ??
    product?.item?._id ??
    product?.item?.id ??
    product?.data?._id ??
    product?.data?.id ??
    product?.data?.productId ??
    "";

  return id
    ? String(id)
    : "";
};

/* ========================================================================
   PRICE KEYS
======================================================================== */

const PRICE_KEYS = [
  "sellingPrice",
  "selling_price",
  "discountPrice",
  "discount_price",
  "salePrice",
  "sale_price",
  "unitPrice",
  "unit_price",
  "price",
  "finalPrice",
  "final_price",
  "currentPrice",
  "current_price",
  "offerPrice",
  "offer_price",
  "amount",
  "unit_amount",
  "mrp",
  "productPrice",
  "product_price",
  "costPrice",
  "cost_price",
  "displayPrice",
  "display_price",
  "value",
];

/* ========================================================================
   PRODUCT PRICE
======================================================================== */

const getProductPrice = (
  product = {}
) => {
  if (
    product === null ||
    product === undefined
  ) {
    return 0;
  }

  if (
    typeof product ===
      "string" ||
    typeof product ===
      "number"
  ) {
    return toPositiveNumber(
      product
    );
  }

  const objects = [
    product,
    product?.product,
    product?.productDetails,
    product?.productData,
    product?.item,
    product?.data,
    product?.details,
    product?.variant,
    product?.variants?.[0],
    product?.product?.data,
    product?.product?.details,
    product?.productDetails?.data,
    product?.productData?.data,
    product?.data?.product,
    product?.data?.productDetails,
    product?.data?.productData,
  ];

  for (
    const object of objects
  ) {
    if (
      !object ||
      typeof object !==
        "object"
    ) {
      continue;
    }

    for (
      const key of PRICE_KEYS
    ) {
      const price =
        toPositiveNumber(
          object?.[key]
        );

      if (
        price > 0
      ) {
        return price;
      }
    }
  }

  const visited =
    new Set();

  const findPrice = (
    value,
    depth = 0
  ) => {
    if (
      depth > 8 ||
      value === null ||
      value === undefined
    ) {
      return 0;
    }

    if (
      typeof value !==
      "object"
    ) {
      return 0;
    }

    if (
      visited.has(value)
    ) {
      return 0;
    }

    visited.add(value);

    for (
      const key of PRICE_KEYS
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          value,
          key
        )
      ) {
        const price =
          toPositiveNumber(
            value[key]
          );

        if (
          price > 0
        ) {
          return price;
        }
      }
    }

    for (
      const key of Object.keys(
        value
      )
    ) {
      const child =
        value[key];

      if (
        child &&
        typeof child ===
          "object"
      ) {
        const result =
          findPrice(
            child,
            depth + 1
          );

        if (
          result > 0
        ) {
          return result;
        }
      }
    }

    if (
      Array.isArray(value)
    ) {
      for (
        const child of value
      ) {
        const result =
          findPrice(
            child,
            depth + 1
          );

        if (
          result > 0
        ) {
          return result;
        }
      }
    }

    return 0;
  };

  return findPrice(
    product
  );
};

/* ========================================================================
   NAME
======================================================================== */

const getProductName = (
  product = {}
) => {
  if (
    typeof product ===
    "string"
  ) {
    return product;
  }

  if (
    typeof product ===
    "number"
  ) {
    return String(
      product
    );
  }

  return (
    product?.name ||
    product?.productName ||
    product?.title ||
    product?.displayName ||
    product?.itemName ||
    product?.product?.name ||
    product?.product?.productName ||
    product?.product?.title ||
    product?.product?.displayName ||
    product?.productDetails?.name ||
    product?.productDetails?.productName ||
    product?.productDetails?.title ||
    product?.productData?.name ||
    product?.productData?.productName ||
    product?.productData?.title ||
    product?.item?.name ||
    product?.item?.productName ||
    product?.data?.name ||
    product?.data?.productName ||
    product?.data?.title ||
    "Product"
  );
};

/* ========================================================================
   QUANTITY
======================================================================== */

const getProductQuantity = (
  product = {}
) => {
  const quantity =
    product?.quantity ??
    product?.qty ??
    product?.count ??
    product?.predictedQuantity ??
    product?.recommendedQuantity ??
    product?.refillQuantity ??
    product?.requiredQuantity ??
    product?.product?.quantity ??
    product?.product?.qty ??
    product?.product?.predictedQuantity ??
    product?.productDetails?.quantity ??
    product?.productDetails?.qty ??
    1;

  const parsed =
    Number(
      quantity
    );

  if (
    !Number.isFinite(
      parsed
    ) ||
    parsed <= 0
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      parsed
    )
  );
};

/* ========================================================================
   NORMALIZE PRODUCT
======================================================================== */

const normalizeAIProduct = (
  product = {}
) => {
  const id =
    getProductId(
      product
    );

  const price =
    getProductPrice(
      product
    );

  const image =
    getProductImage(
      product
    );

  const quantity =
    getProductQuantity(
      product
    );

  return {
    ...product,

    id,
    _id: id,
    productId: id,

    name:
      getProductName(
        product
      ),

    price,

    sellingPrice:
      price,

    unitPrice:
      price,

    image,

    imageUrl:
      image,

    quantity,
    qty: quantity,
  };
};

/* ========================================================================
   RESPONSE ARRAY
======================================================================== */

const normalizeArray = (
  response
) => {
  if (
    Array.isArray(
      response
    )
  ) {
    return response;
  }

  const possibleKeys = [
    "products",
    "items",
    "recommendations",
    "basket",
    "refill",
    "smartRefill",
    "results",
    "data",
  ];

  for (
    const key of possibleKeys
  ) {
    if (
      Array.isArray(
        response?.[key]
      )
    ) {
      return response[key];
    }

    if (
      Array.isArray(
        response?.data?.[key]
      )
    ) {
      return response.data[key];
    }
  }

  return [];
};

/* ========================================================================
   RECIPE
======================================================================== */

const getRecipeArray = (
  response
) => {
  if (
    Array.isArray(
      response
    )
  ) {
    return response;
  }

  const keys = [
    "recipes",
    "suggestions",
    "recommendations",
    "recipeSuggestions",
    "results",
  ];

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        response?.[key]
      )
    ) {
      return response[key];
    }

    if (
      Array.isArray(
        response?.data?.[key]
      )
    ) {
      return response.data[key];
    }
  }

  if (
    response?.data &&
    typeof response.data ===
      "object" &&
    !Array.isArray(
      response.data
    ) &&
    (
      response.data.name ||
      response.data.title
    )
  ) {
    return [
      response.data,
    ];
  }

  return [];
};

const getRecipeName = (
  recipe = {}
) => {
  if (
    typeof recipe ===
    "string"
  ) {
    return recipe;
  }

  return (
    recipe?.name ||
    recipe?.title ||
    recipe?.recipeName ||
    recipe?.dishName ||
    "AI Recipe"
  );
};

const getRecipeIngredients = (
  recipe = {}
) => {
  if (
    typeof recipe ===
    "string"
  ) {
    return [];
  }

  const value =
    recipe?.ingredients ||
    recipe?.ingredientList ||
    recipe?.requiredIngredients ||
    recipe?.items ||
    recipe?.products ||
    [];

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (item) => {
          if (
            typeof item ===
            "string"
          ) {
            return item;
          }

          return (
            item?.name ||
            item?.ingredient ||
            item?.item ||
            item?.productName ||
            item?.title ||
            ""
          );
        }
      )
      .map(
        (item) =>
          String(item)
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);
  }

  if (
    typeof value ===
    "string"
  ) {
    return value
      .split(",")
      .map(
        (item) =>
          item
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);
  }

  return [];
};

const getRecipeInstructions = (
  recipe = {}
) => {
  const value =
    recipe?.instructions ||
    recipe?.steps ||
    recipe?.method ||
    recipe?.directions ||
    "";

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (item) => {
          if (
            typeof item ===
            "string"
          ) {
            return item;
          }

          return (
            item?.instruction ||
            item?.step ||
            item?.description ||
            ""
          );
        }
      )
      .filter(Boolean)
      .join("\n");
  }

  return String(
    value || ""
  );
};

/* ========================================================================
   TEXT MATCH
======================================================================== */

const normalizeText = (
  value
) => {
  return String(
    value || ""
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/gi,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

const isProductMatchingIngredient = (
  product,
  ingredient
) => {
  const productName =
    normalizeText(
      getProductName(
        product
      )
    );

  const ingredientName =
    normalizeText(
      ingredient
    );

  if (
    !productName ||
    !ingredientName
  ) {
    return false;
  }

  if (
    productName.includes(
      ingredientName
    ) ||
    ingredientName.includes(
      productName
    )
  ) {
    return true;
  }

  const tokens =
    ingredientName
      .split(" ")
      .filter(
        (token) =>
          token.length >= 3
      );

  if (
    !tokens.length
  ) {
    return false;
  }

  const matches =
    tokens.filter(
      (token) =>
        productName.includes(
          token
        )
    );

  return (
    matches.length >=
    Math.max(
      1,
      Math.ceil(
        tokens.length / 2
      )
    )
  );
};

/* ========================================================================
   ENRICH PRODUCT
======================================================================== */

const enrichProductWithStoreData =
  async (
    product
  ) => {
    const normalized =
      normalizeAIProduct(
        product
      );

    const currentPrice =
      getProductPrice(
        normalized
      );

    const currentImage =
      getProductImage(
        normalized
      );

    if (
      currentPrice > 0 &&
      currentImage
    ) {
      return normalized;
    }

    const name =
      getProductName(
        normalized
      );

    if (
      !name ||
      name === "Product"
    ) {
      return normalized;
    }

    try {
      const response =
        await aiApi.products(
          name,
          30
        );

      const candidates =
        normalizeArray(
          response
        ).map(
          normalizeAIProduct
        );

      if (
        !candidates.length
      ) {
        return normalized;
      }

      const productId =
        getProductId(
          normalized
        );

      let matched =
        candidates.find(
          (item) =>
            productId &&
            getProductId(
              item
            ) ===
              productId
        );

      if (!matched) {
        const normalizedName =
          normalizeText(
            name
          );

        matched =
          candidates.find(
            (item) =>
              normalizeText(
                getProductName(
                  item
                )
              ) ===
              normalizedName
          );
      }

      if (!matched) {
        matched =
          candidates.find(
            (item) =>
              isProductMatchingIngredient(
                item,
                name
              )
          );
      }

      if (!matched) {
        return normalized;
      }

      const finalId =
        getProductId(
          normalized
        ) ||
        getProductId(
          matched
        );

      const finalPrice =
        currentPrice > 0
          ? currentPrice
          : getProductPrice(
              matched
            );

      const finalImage =
        currentImage ||
        getProductImage(
          matched
        );

      const finalName =
        getProductName(
          normalized
        ) !== "Product"
          ? getProductName(
              normalized
            )
          : getProductName(
              matched
            );

      return {
        ...matched,
        ...normalized,

        id:
          finalId,

        _id:
          finalId,

        productId:
          finalId,

        name:
          finalName,

        price:
          finalPrice,

        sellingPrice:
          finalPrice,

        unitPrice:
          finalPrice,

        image:
          finalImage,

        imageUrl:
          finalImage,

        quantity:
          getProductQuantity(
            normalized
          ),

        qty:
          getProductQuantity(
            normalized
          ),
      };
    } catch (error) {
      console.error(
        "PRODUCT PRICE/IMAGE ENRICH ERROR:",
        error
      );

      return normalized;
    }
  };

/* ========================================================================
   ENRICH PRODUCTS
======================================================================== */

const enrichProducts = async (
  products
) => {
  if (
    !products?.length
  ) {
    return [];
  }

  const unique =
    new Map();

  products.forEach(
    (product) => {
      const id =
        getProductId(
          product
        );

      /*
       * ID available hai.
       */
      if (id) {
        unique.set(
          id,
          product
        );
        return;
      }

      /*
       * ID nahi hai to name se
       * temporary unique key.
       */
      const name =
        normalizeText(
          getProductName(
            product
          )
        );

      if (name) {
        unique.set(
          `name:${name}`,
          product
        );
      }
    }
  );

  const result =
    await Promise.all(
      Array.from(
        unique.values()
      ).map(
        enrichProductWithStoreData
      )
    );

  return result;
};

/* ========================================================================
   SECTION TITLE
======================================================================== */

/* ========================================================================
   SECTION TITLE
======================================================================== */

const SectionTitle = ({
  emoji,
  title,
  subtitle,
}) => (
  <div className="mb-5">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-2xl shadow-sm">
        {emoji}
      </span>

      <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight md:text-2xl">
        {title}
      </h2>
    </div>

    {subtitle && (
      <p className="mt-1.5 ml-1 text-sm text-zinc-400 font-medium">
        {subtitle}
      </p>
    )}
  </div>
);

/* ========================================================================
   LOADING BUTTON
======================================================================== */

const LoadingButton = ({
  loading,
  children,
  ...props
}) => (
  <button
    {...props}
    type={
      props.type ||
      "button"
    }
    disabled={
      loading ||
      props.disabled
    }
    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 shadow-md ${
      loading ||
      props.disabled
        ? "cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700/50"
        : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
    } ${
      props.className ||
      ""
    }`}
  >
    {loading
      ? "Please wait..."
      : children}
  </button>
);

/* ========================================================================
   PRODUCT CARD
======================================================================== */

const ProductCard = ({
  product,
  onAdd,
}) => {
  const normalized =
    normalizeAIProduct(
      product
    );

  const name =
    getProductName(
      normalized
    );

  const price =
    getProductPrice(
      normalized
    );

  const image =
    getProductImage(
      normalized
    );

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

      <div className="flex h-44 items-center justify-center bg-zinc-950/60 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ImageWithFallback
          src={image}
          alt={name}
          className="h-full w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fallbackClassName="h-full w-full"
        />
      </div>

      <div className="p-4 bg-zinc-900">

        <h3 className="line-clamp-2 min-h-[42px] font-semibold text-zinc-200 text-sm tracking-wide">
          {name}
        </h3>

        <div className="mt-4 flex items-center justify-between gap-2">

          <span className="font-extrabold text-emerald-400 text-base">
            {price > 0
              ? formatPrice(
                  price
                )
              : "Price unavailable"}
          </span>

          <button
            type="button"
            onClick={() =>
              onAdd?.(
                normalized
              )
            }
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400 transition-all duration-200 hover:bg-emerald-500 hover:text-zinc-950 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            ADD
          </button>

        </div>

      </div>
    </div>
  );
};

/* ========================================================================
   SMART REFILL CARD
======================================================================== */

const SmartRefillCard = ({
  product,
  onAdd,
}) => {
  const normalized =
    normalizeAIProduct(
      product
    );

  const name =
    getProductName(
      normalized
    );

  const price =
    getProductPrice(
      normalized
    );

  const quantity =
    getProductQuantity(
      normalized
    );

  const image =
    getProductImage(
      normalized
    );

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

      <div className="flex h-44 items-center justify-center bg-zinc-950/60 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ImageWithFallback
          src={image}
          alt={name}
          className="h-full w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fallbackClassName="h-full w-full"
        />
      </div>

      <div className="p-4 bg-zinc-900">

        <h3 className="line-clamp-2 min-h-[42px] font-bold text-zinc-100 text-sm tracking-wide">
          {name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">

          <span className="text-base font-extrabold text-emerald-400">
            {price > 0
              ? formatPrice(
                  price
                )
              : "Price unavailable"}
          </span>

          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-bold text-cyan-400 shadow-sm">
            Refill × {quantity}
          </span>

        </div>

        <button
          type="button"
          onClick={() =>
            onAdd?.(
              normalized
            )
          }
          className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-zinc-950 tracking-wide transition-all duration-300 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
        >
          Add to AI Shopping Plan
        </button>

      </div>
    </div>
  );
};

/* ========================================================================
   MAIN
======================================================================== */

const AIFeatures = () => {
  const user = useSelector((state) => state?.user);
  const navigate =
    useNavigate();

  const globalContext =
    useGlobalContext() || {};

  const {
    fetchCartItem,
  } = globalContext;

const currentUser =
  globalContext?.user ||
  globalContext?.currentUser ||
  globalContext?.userData ||
  globalContext?.userDetails ||
  globalContext?.profile ||
  null;

const isAdmin = useMemo(() => {
    if (!user?._id) return false;

    const possibleRoles = [
        user?.role,
        user?.userRole,
        user?.accountType,

        user?.user?.role,
        user?.user?.userRole,
        user?.user?.accountType,

        user?.data?.role,
        user?.data?.userRole,
        user?.data?.accountType,

        user?.profile?.role,
        user?.profile?.userRole,
        user?.profile?.accountType,
    ];

    return possibleRoles.some((role) => {
        const normalizedRole = String(role || "")
            .trim()
            .toLowerCase();

        return (
            normalizedRole === "admin" ||
            normalizedRole === "administrator"
        );
    });
}, [user]);

console.log("AI ADMIN DEBUG:", {
  user,
 isAdmin,
});
  /* ======================================================================
     TAB
  ====================================================================== */

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "basket"
  );

  useEffect(() => {
    if (
      activeTab ===
        "tools" &&
      !isAdmin
    ) {
      setActiveTab(
        "basket"
      );
    }
  }, [
    activeTab,
    isAdmin,
  ]);

  /* ======================================================================
     BASKET
  ====================================================================== */

  const [
    basketBudget,
    setBasketBudget,
  ] = useState("1500");

  const [
    basketPeople,
    setBasketPeople,
  ] = useState("4");

  const [
    basketDays,
    setBasketDays,
  ] = useState("3");

  const [
    basketLoading,
    setBasketLoading,
  ] = useState(false);

  const [
    basketResult,
    setBasketResult,
  ] = useState(null);

  /* ======================================================================
     RECOMMENDATIONS
  ====================================================================== */

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);

  /* ======================================================================
     REFILL
  ====================================================================== */

  const [
    refillResult,
    setRefillResult,
  ] = useState(null);

  const [
    refillLoading,
    setRefillLoading,
  ] = useState(false);

  const [
    refillError,
    setRefillError,
  ] = useState("");

  const [
    refillProducts,
    setRefillProducts,
  ] = useState([]);

  /* ======================================================================
     FORGOT
  ====================================================================== */

  const [
    forgotResult,
    setForgotResult,
  ] = useState(null);

  const [
    forgotLoading,
    setForgotLoading,
  ] = useState(false);

  /* ======================================================================
     RECIPES
  ====================================================================== */

  const [
    ingredients,
    setIngredients,
  ] = useState("");

  const [
    recipeRequirement,
    setRecipeRequirement,
  ] = useState("");

  const [
    recipeBudget,
    setRecipeBudget,
  ] = useState("500");

  const [
    recipePeople,
    setRecipePeople,
  ] = useState("2");

  const [
    recipeLoading,
    setRecipeLoading,
  ] = useState(false);

  const [
    recipeResult,
    setRecipeResult,
  ] = useState(null);

  const [
    recipeAvailableProducts,
    setRecipeAvailableProducts,
  ] = useState([]);

  /* ======================================================================
     HEALTHY
  ====================================================================== */

  const [
    healthyBudget,
    setHealthyBudget,
  ] = useState("1000");

  const [
    healthyPeople,
    setHealthyPeople,
  ] = useState("4");

  const [
    healthyLoading,
    setHealthyLoading,
  ] = useState(false);

  const [
    healthyResult,
    setHealthyResult,
  ] = useState(null);

  /* ======================================================================
     ADMIN
  ====================================================================== */

  const [
    substitutionProductId,
    setSubstitutionProductId,
  ] = useState("");

  const [
    substitutionLoading,
    setSubstitutionLoading,
  ] = useState(false);

  const [
    substitutionResult,
    setSubstitutionResult,
  ] = useState(null);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    pricingLoading,
    setPricingLoading,
  ] = useState(false);

  const [
    pricingResult,
    setPricingResult,
  ] = useState(null);

  const [
    demandProductId,
    setDemandProductId,
  ] = useState("");

  const [
    demandLoading,
    setDemandLoading,
  ] = useState(false);

  const [
    demandResult,
    setDemandResult,
  ] = useState(null);

  /* ======================================================================
     PRODUCTS
  ====================================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(false);

  /* ======================================================================
     AI CART
  ====================================================================== */

  const [
    cartItems,
    setCartItems,
  ] = useState([]);

  const [
    aiCartLoading,
    setAiCartLoading,
  ] = useState(false);

  /* ======================================================================
     TOTAL
  ====================================================================== */

  const totalCartPrice =
    useMemo(() => {
      return cartItems.reduce(
        (
          total,
          rawItem
        ) => {
          const item =
            normalizeAIProduct(
              rawItem
            );

          const price =
            getProductPrice(
              item
            );

          const quantity =
            getProductQuantity(
              item
            );

          return (
            total +
            price *
              quantity
          );
        },
        0
      );
    }, [
      cartItems,
    ]);

  const totalCartQuantity =
    useMemo(() => {
      return cartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          getProductQuantity(
            item
          ),
        0
      );
    }, [
      cartItems,
    ]);

  /* ======================================================================
     ADD AI CART
  ====================================================================== */

  const addToAICart = (
    product
  ) => {
    const normalized =
      normalizeAIProduct(
        product
      );

    const id =
      getProductId(
        normalized
      );

    if (!id) {
      toast.error(
        "Product ID not available"
      );
      return;
    }

    setCartItems(
      (items) => {
        const index =
          items.findIndex(
            (item) =>
              getProductId(
                item
              ) === id
          );

        if (
          index >= 0
        ) {
          return items.map(
            (
              item,
              itemIndex
            ) => {
              if (
                itemIndex !==
                index
              ) {
                return item;
              }

              const quantity =
                getProductQuantity(
                  item
                ) + 1;

              return {
                ...normalizeAIProduct(
                  item
                ),
                quantity,
                qty:
                  quantity,
              };
            }
          );
        }

        return [
          ...items,
          {
            ...normalized,
            quantity: 1,
            qty: 1,
          },
        ];
      }
    );

    toast.success(
      `${getProductName(
        normalized
      )} added to My AI Shopping Plan`
    );
  };

  /* ======================================================================
     QUANTITY
  ====================================================================== */

  const increaseQuantity = (
    productId
  ) => {
    setCartItems(
      (items) =>
        items.map(
          (rawItem) => {
            const item =
              normalizeAIProduct(
                rawItem
              );

            if (
              getProductId(
                item
              ) !==
              String(
                productId
              )
            ) {
              return rawItem;
            }

            const quantity =
              getProductQuantity(
                item
              ) + 1;

            return {
              ...item,
              quantity,
              qty:
                quantity,
            };
          }
        )
    );
  };

  const decreaseQuantity = (
    productId
  ) => {
    setCartItems(
      (items) =>
        items.map(
          (rawItem) => {
            const item =
              normalizeAIProduct(
                rawItem
              );

            if (
              getProductId(
                item
              ) !==
              String(
                productId
              )
            ) {
              return rawItem;
            }

            const quantity =
              Math.max(
                1,
                getProductQuantity(
                  item
                ) - 1
              );

            return {
              ...item,
              quantity,
              qty:
                quantity,
            };
          }
        )
    );
  };

  const removeFromAICart = (
    productId
  ) => {
    setCartItems(
      (items) =>
        items.filter(
          (item) =>
            getProductId(
              item
            ) !==
            String(
              productId
            )
        )
    );
  };

  /* ======================================================================
     REAL CART
  ====================================================================== */

  const addExactItemToRealCart =
    async (
      rawItem
    ) => {
      const item =
        normalizeAIProduct(
          rawItem
        );

      const productId =
        getProductId(
          item
        );

      const quantity =
        getProductQuantity(
          item
        );

      if (!productId) {
        throw new Error(
          `${getProductName(
            item
          )}: Product ID missing`
        );
      }

      const result =
        await addToCartProduct(
          productId,
          quantity
        );

      if (
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            `${getProductName(
              item
            )} could not be added to cart`
        );
      }

      return result;
    };

  const moveAICartToRealCart =
    async () => {
      if (
        !cartItems.length
      ) {
        toast.error(
          "My AI Shopping Plan is empty"
        );
        return;
      }

      if (
        aiCartLoading
      ) {
        return;
      }

      try {
        setAiCartLoading(
          true
        );

        let totalUnits = 0;

        for (
          const item of cartItems
        ) {
          await addExactItemToRealCart(
            item
          );

          totalUnits +=
            getProductQuantity(
              item
            );
        }

        if (
          typeof fetchCartItem ===
          "function"
        ) {
          await fetchCartItem();
        }

        setCartItems([]);

        toast.success(
          `${totalUnits} item${
            totalUnits ===
            1
              ? ""
              : "s"
          } added to your cart`
        );

        navigate(
          "/cart"
        );
      } catch (error) {
        console.error(
          "AI CART ERROR:",
          error
        );

        AxiosToastError(
          error
        );
      } finally {
        setAiCartLoading(
          false
        );
      }
    };

  /* ======================================================================
     CHEAPEST BASKET
  ====================================================================== */

  const runCheapestBasket =
    async () => {
      const budget =
        Number(
          basketBudget
        );

      const people =
        Number(
          basketPeople
        );

      const days =
        Number(
          basketDays
        );

      if (
        !Number.isFinite(
          budget
        ) ||
        budget <= 0
      ) {
        toast.error(
          "Enter a valid budget"
        );
        return;
      }

      if (
        !Number.isFinite(
          people
        ) ||
        people <= 0
      ) {
        toast.error(
          "Enter valid number of people"
        );
        return;
      }

      if (
        !Number.isFinite(
          days
        ) ||
        days <= 0
      ) {
        toast.error(
          "Enter valid number of days"
        );
        return;
      }

      try {
        setBasketLoading(
          true
        );

        const response =
          await aiApi.cheapestBasket(
            {
              budget,
              people,
              days,
            }
          );

        setBasketResult(
          response
        );

        const raw =
          normalizeArray(
            response
          ).map(
            normalizeAIProduct
          );

        const enriched =
          await enrichProducts(
            raw
          );

        const items =
          enriched.filter(
            (item) =>
              getProductId(
                item
              )
          );

        if (
          items.length
        ) {
          setCartItems(
            items
          );

          toast.success(
            "Cheapest basket generated"
          );
        } else {
          setCartItems(
            []
          );

          toast(
            "No products were returned."
          );
        }
      } catch (error) {
        console.error(
          "Basket error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to create basket"
        );
      } finally {
        setBasketLoading(
          false
        );
      }
    };

  /* ======================================================================
     RECOMMENDATIONS
  ====================================================================== */

  const loadRecommendations =
    async () => {
      if (
        recommendationLoading
      ) {
        return;
      }

      try {
        setRecommendationLoading(
          true
        );

        const response =
          await aiApi.recommendations(
            8
          );

        const raw =
          normalizeArray(
            response
          ).map(
            normalizeAIProduct
          );

        const items =
          await enrichProducts(
            raw
          );

        setRecommendations(
          items.filter(
            (item) =>
              getProductId(
                item
              )
          )
        );

        toast.success(
          "Personalized recommendations loaded"
        );
      } catch (error) {
        console.error(
          "Recommendation error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to load recommendations"
        );
      } finally {
        setRecommendationLoading(
          false
        );
      }
    };

  /* ======================================================================
     SMART REFILL
  ====================================================================== */

  const loadSmartRefill =
    async () => {
      if (
        refillLoading
      ) {
        return;
      }

      try {
        setRefillLoading(
          true
        );

        setRefillError(
          ""
        );

        setRefillResult(
          null
        );

        setRefillProducts(
          []
        );

        const response =
          await aiApi.smartRefill();

        setRefillResult(
          response
        );

        const raw =
          normalizeArray(
            response
          ).map(
            normalizeAIProduct
          );

        const enriched =
          await enrichProducts(
            raw
          );

        const items =
          enriched.filter(
            (item) =>
              getProductId(
                item
              )
          );

        setRefillProducts(
          items
        );

        if (
          items.length
        ) {
          setCartItems(
            items.map(
              (item) => ({
                ...item,
                quantity:
                  getProductQuantity(
                    item
                  ),
                qty:
                  getProductQuantity(
                    item
                  ),
              })
            )
          );

          toast.success(
            `${items.length} smart refill product${
              items.length ===
              1
                ? ""
                : "s"
            } found`
          );
        } else {
          toast(
            "No refill products found."
          );
        }
      } catch (error) {
        console.error(
          "Smart refill error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.message ||
          "Unable to load smart refill.";

        setRefillError(
          message
        );

        toast.error(
          message
        );
      } finally {
        setRefillLoading(
          false
        );
      }
    };

  /* ======================================================================
     FORGOT
  ====================================================================== */

  const checkForgotSomething =
    async () => {
      try {
        setForgotLoading(
          true
        );

        const ids =
          cartItems
            .map(
              getProductId
            )
            .filter(Boolean);

        const response =
          await aiApi.forgotSomething(
            ids
          );

        setForgotResult(
          response
        );

        toast.success(
          "AI checked your shopping plan"
        );
      } catch (error) {
        toast.error(
          error?.message ||
            "Unable to check your cart"
        );
      } finally {
        setForgotLoading(
          false
        );
      }
    };

  /* ======================================================================
     RECIPE STORE PRODUCTS
  ====================================================================== */

  const findAvailableRecipeProducts =
    async (
      recipes
    ) => {
      const ingredientsSet =
        new Set();

      recipes.forEach(
        (recipe) => {
          getRecipeIngredients(
            recipe
          ).forEach(
            (ingredient) =>
              ingredientsSet.add(
                ingredient
              )
          );
        }
      );

      if (
        !ingredientsSet.size
      ) {
        ingredients
          .split(",")
          .map(
            (x) =>
              x.trim().toLowerCase()
          )
          .filter(Boolean)
          .forEach(
            (x) =>
              ingredientsSet.add(
                x
              )
          );
      }

      const all = [];

      for (
        const ingredient of ingredientsSet
      ) {
        try {
          const response =
            await aiApi.products(
              ingredient,
              30
            );

          const found =
            normalizeArray(
              response
            )
              .map(
                normalizeAIProduct
              )
              .filter(
                (product) =>
                  getProductId(
                    product
                  )
              )
              .filter(
                (product) =>
                  isProductMatchingIngredient(
                    product,
                    ingredient
                  )
              );

          all.push(
            ...found
          );
        } catch (error) {
          console.error(
            "Recipe product search error:",
            error
          );
        }
      }

      return enrichProducts(
        all
      );
    };

  /* ======================================================================
     RECIPES
  ====================================================================== */

  const generateRecipes =
    async () => {
      const input =
        ingredients
          .split(",")
          .map(
            (x) =>
              x.trim()
          )
          .filter(Boolean);

      const cartIngredients =
        cartItems
          .map(
            getProductName
          )
          .filter(Boolean);

      const finalIngredients =
        input.length
          ? input
          : cartIngredients;

      if (
        !finalIngredients.length
      ) {
        toast.error(
          "Enter ingredients or add products to My AI Shopping Plan"
        );
        return;
      }

      const budget =
        Number(
          recipeBudget
        );

      const people =
        Number(
          recipePeople
        );

      if (
        budget <= 0 ||
        people <= 0
      ) {
        toast.error(
          "Enter valid budget and people"
        );
        return;
      }

      try {
        setRecipeLoading(
          true
        );

        const response =
          await aiApi.recipes(
            finalIngredients,
            budget,
            {
              requirement:
                recipeRequirement.trim(),

              userRequirement:
                recipeRequirement.trim(),

              basedOnCart:
                cartIngredients,

              people,
            }
          );

        setRecipeResult(
          response
        );

        const recipes =
          getRecipeArray(
            response
          );

        const available =
          await findAvailableRecipeProducts(
            recipes
          );

        setRecipeAvailableProducts(
          available
        );

        setCartItems(
          available.map(
            (product) => ({
              ...product,
              quantity: 1,
              qty: 1,
            })
          )
        );

        toast.success(
          "Recipes generated"
        );
      } catch (error) {
        console.error(
          "Recipe error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to generate recipes"
        );
      } finally {
        setRecipeLoading(
          false
        );
      }
    };

  /* ======================================================================
     HEALTHY BASKET
  ====================================================================== */

  const generateHealthyBasket =
    async () => {
      const budget =
        Number(
          healthyBudget
        );

      const people =
        Number(
          healthyPeople
        );

      if (
        budget <= 0 ||
        people <= 0
      ) {
        toast.error(
          "Enter valid budget and people"
        );
        return;
      }

      try {
        setHealthyLoading(
          true
        );

        const response =
          await aiApi.healthyBasket(
            {
              budget,
              people,
            }
          );

        setHealthyResult(
          response
        );

        const raw =
          normalizeArray(
            response
          ).map(
            normalizeAIProduct
          );

        const items =
          await enrichProducts(
            raw
          );

        setCartItems(
          items.filter(
            (item) =>
              getProductId(
                item
              )
          )
        );

        toast.success(
          "Healthy basket generated"
        );
      } catch (error) {
        console.error(
          "Healthy basket error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to generate healthy basket"
        );
      } finally {
        setHealthyLoading(
          false
        );
      }
    };

  /* ======================================================================
     SEARCH
  ====================================================================== */

  const searchProducts =
    async () => {
      if (
        !search.trim()
      ) {
        toast.error(
          "Enter a product name"
        );
        return;
      }

      try {
        setProductsLoading(
          true
        );

        const response =
          await aiApi.products(
            search.trim(),
            50
          );

        const raw =
          normalizeArray(
            response
          ).map(
            normalizeAIProduct
          );

        const items =
          await enrichProducts(
            raw
          );

        setProducts(
          items.filter(
            (item) =>
              getProductId(
                item
              )
          )
        );
      } catch (error) {
        console.error(
          "Search error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to load products"
        );
      } finally {
        setProductsLoading(
          false
        );
      }
    };

  /* ======================================================================
     ADMIN
  ====================================================================== */

  const getSubstitution =
    async () => {
      if (
        !isAdmin
      ) {
        toast.error(
          "Admin access required"
        );
        return;
      }

      if (
        !substitutionProductId.trim()
      ) {
        toast.error(
          "Enter product ID"
        );
        return;
      }

      try {
        setSubstitutionLoading(
          true
        );

        const response =
          await aiApi.substitution(
            substitutionProductId.trim()
          );

        setSubstitutionResult(
          response
        );

        toast.success(
          "Alternatives found"
        );
      } catch (error) {
        toast.error(
          error?.message ||
            "Unable to find alternatives"
        );
      } finally {
        setSubstitutionLoading(
          false
        );
      }
    };

  const getDynamicPricing =
    async () => {
      if (
        !isAdmin
      ) {
        toast.error(
          "Admin access required"
        );
        return;
      }

      if (
        !selectedProductId.trim()
      ) {
        toast.error(
          "Enter product ID"
        );
        return;
      }

      try {
        setPricingLoading(
          true
        );

        const response =
          await aiApi.dynamicPricing(
            selectedProductId.trim()
          );

        setPricingResult(
          response
        );

        toast.success(
          "Price calculation completed"
        );
      } catch (error) {
        toast.error(
          error?.message ||
            "Unable to calculate price"
        );
      } finally {
        setPricingLoading(
          false
        );
      }
    };

  const getDemandForecast =
    async () => {
      if (
        !isAdmin
      ) {
        toast.error(
          "Admin access required"
        );
        return;
      }

      if (
        !demandProductId.trim()
      ) {
        toast.error(
          "Enter product ID"
        );
        return;
      }

      try {
        setDemandLoading(
          true
        );

        const response =
          await aiApi.demandForecast(
            demandProductId.trim(),
            7
          );

        setDemandResult(
          response
        );

        toast.success(
          "Demand forecast generated"
        );
      } catch (error) {
        toast.error(
          error?.message ||
            "Unable to generate forecast"
        );
      } finally {
        setDemandLoading(
          false
        );
      }
    };

  /* ======================================================================
     TABS
  ====================================================================== */

  const tabs = [
    {
      id: "basket",
      label: "Cheapest Basket",
      emoji: "💰",
    },
    {
      id: "recommendations",
      label: "For You",
      emoji: "✨",
    },
    {
      id: "refill",
      label: "Smart Refill",
      emoji: "🔄",
    },
    {
      id: "recipes",
      label: "Recipes",
      emoji: "🍳",
    },
    {
      id: "healthy",
      label: "Healthy Basket",
      emoji: "🥗",
    },
    ...(isAdmin
      ? [
          {
            id: "tools",
            label: "AI Tools",
            emoji: "🧠",
          },
        ]
      : []),
  ];

  /* ======================================================================
     RENDER
  ====================================================================== */

return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950">

      {/* HERO */}

      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 px-4 py-10 text-zinc-100 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400 backdrop-blur shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                🤖 NeoBasket AI Pro
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Your Personal Grocery AI
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg font-medium">
                Optimize your grocery
                budget, discover products,
                generate recipes and build
                your personalized AI shopping
                plan.
              </p>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                  My AI Shopping Plan
                </div>

                <div className="mt-2 text-3xl font-extrabold text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  {formatPrice(
                    totalCartPrice
                  )}
                </div>

                <div className="mt-2 text-xs font-semibold text-zinc-400">
                  {totalCartQuantity} item
                  {totalCartQuantity ===
                  1
                    ? ""
                    : "s"}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">

        {/* TABS */}

        <div className="mb-8 overflow-x-auto pb-2">

          <div className="flex min-w-max gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2 shadow-xl backdrop-blur">

            {tabs.map(
              (tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`rounded-xl px-5 py-3 text-xs font-extrabold transition-all duration-300 flex items-center ${
                    activeTab ===
                    tab.id
                      ? "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <span className="mr-2 text-base">
                    {tab.emoji}
                  </span>

                  {tab.label}
                </button>
              )
            )}

          </div>

        </div>

        {/* ================================================================
            BASKET
        ================================================================ */}

        {activeTab ===
          "basket" && (
          <section>

            <SectionTitle
              emoji="💰"
              title="Cheapest Basket"
              subtitle="AI finds the best combination of available products within your budget."
            />

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

              <div className="grid gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Budget
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      basketBudget
                    }
                    onChange={(e) =>
                      setBasketBudget(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

<div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    People
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      basketPeople
                    }
                    onChange={(e) =>
                      setBasketPeople(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Days
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      basketDays
                    }
                    onChange={(e) =>
                      setBasketDays(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <LoadingButton
                loading={
                  basketLoading
                }
                onClick={
                  runCheapestBasket
                }
                className="mt-6 w-full md:w-auto"
              >
                Optimize My Basket
              </LoadingButton>

            </div>

            {basketResult && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-zinc-900 p-5 shadow-xl">

                <h3 className="mb-3 font-bold text-zinc-100 flex items-center gap-2">
                  <span>✨</span> AI Optimized Basket
                </h3>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300 shadow-inner">
                  Your optimized basket
                  has been generated.
                  Products are now in My AI
                  Shopping Plan.
                </div>

              </div>
            )}

          </section>
        )}

        {/* ================================================================
            RECOMMENDATIONS
        ================================================================ */}

        {activeTab ===
          "recommendations" && (
          <section>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-6">

              <SectionTitle
                emoji="✨"
                title="Recommended For You"
                subtitle="AI-powered product recommendations based on your shopping behaviour."
              />

              <LoadingButton
                loading={
                  recommendationLoading
                }
                onClick={
                  loadRecommendations
                }
              >
                Refresh Recommendations
              </LoadingButton>

            </div>

            {recommendations.length >
            0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {recommendations.map(
                  (product) => (
                    <ProductCard
                      key={getProductId(
                        product
                      )}
                      product={
                        product
                      }
                      onAdd={
                        addToAICart
                      }
                    />
                  )
                )}

              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center shadow-xl">

                <div className="text-5xl animate-bounce">
                  ✨
                </div>

      <h3 className="mt-4 text-lg font-bold text-zinc-100">
            Get personalized
            recommendations
          </h3>

          <p className="mt-2 text-sm text-zinc-400 font-medium">
            Click the button above
            to ask AI what you might
            like.
          </p>

        </div>
      )}

    </section>
  )}

  {/* ================================================================
      REFILL
  ================================================================ */}

  {activeTab ===
    "refill" && (
    <section>

      <SectionTitle
        emoji="🔄"
        title="Smart Refill"
        subtitle="AI predicts products you may need to buy again."
      />

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 transition-transform duration-300 hover:scale-[1.02]">
            <div className="text-3xl">
              📊
            </div>

            <h3 className="mt-3 font-bold text-zinc-100">
              Purchase patterns
            </h3>

            <p className="mt-1 text-sm text-zinc-400 font-medium">
              AI studies your previous
              shopping behaviour.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 transition-transform duration-300 hover:scale-[1.02]">
            <div className="text-3xl">
              ⏰
            </div>

            <h3 className="mt-3 font-bold text-zinc-100">
              Refill prediction
            </h3>

            <p className="mt-1 text-sm text-zinc-400 font-medium">
              Predicts frequently
              purchased products.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 transition-transform duration-300 hover:scale-[1.02]">
            <div className="text-3xl">
              🛒
            </div>

            <h3 className="mt-3 font-bold text-zinc-100">
              One-click refill
            </h3>

            <p className="mt-1 text-sm text-zinc-400 font-medium">
              Add predicted products to
              your AI shopping plan.
            </p>
          </div>

        </div>

        <LoadingButton
          loading={
            refillLoading
          }
          onClick={
            loadSmartRefill
          }
          className="mt-6"
        >
          Check What I Need
        </LoadingButton>

        {refillError && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400 shadow-inner">
            {refillError}
          </div>
        )}

      </div>

      {refillResult && (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">

          <h3 className="mb-4 font-bold text-zinc-100 flex items-center gap-2">
            <span>🔄</span> Smart Refill Suggestions
          </h3>
                {refillProducts.length >
                0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {refillProducts.map(
                      (product) => (
                        <SmartRefillCard
                          key={getProductId(
                            product
                          )}
                          product={
                            product
                          }
                          onAdd={
                            addToAICart
                          }
                        />
                      )
                    )}

                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center">

                    🛒

                    <div className="text-2xl mb-2">
                      No refill products found
                    </div>

                  </div>
                )}

              </div>
            )}

            <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

              <h3 className="text-lg font-bold text-zinc-100">
                Forgot Something?
              </h3>

              <p className="mt-1 text-sm text-zinc-400 font-medium">
                AI can check your shopping
                plan and suggest commonly
                forgotten essentials.
              </p>

              <LoadingButton
                loading={
                  forgotLoading
                }
                onClick={
                  checkForgotSomething
                }
                className="mt-4"
              >
                Check My Shopping Plan
              </LoadingButton>

              {forgotResult && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300 shadow-inner">
                  AI shopping plan check
                  completed.
                </div>
              )}

            </div>

          </section>
        )}

        {/* ================================================================
            RECIPES
        ================================================================ */}

        {activeTab ===
          "recipes" && (
          <section>

            <SectionTitle
              emoji="🍳"
              title="AI Recipe Generator"
              subtitle="Generate recipes from your ingredients and shopping plan."
            />

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ingredients
              </label>

              <input
                value={
                  ingredients
                }
                onChange={(e) =>
                  setIngredients(
                    e.target.value
                  )
                }
                placeholder="rice, dal, tomato, onion, paneer"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />

              <p className="mt-2 text-xs font-medium text-zinc-500">
                Leave empty to use your AI
                Shopping Plan.
              </p>

              <label className="mt-5 mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                What do you want?
              </label>

              <textarea
                value={
                  recipeRequirement
                }
                onChange={(e) =>
                  setRecipeRequirement(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="High protein vegetarian dinner for 2 people..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Recipe Budget
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      recipeBudget
                    }
                    onChange={(e) =>
                      setRecipeBudget(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    People
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      recipePeople
                    }
                    onChange={(e) =>
                      setRecipePeople(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <LoadingButton
                loading={
                  recipeLoading
                }
                onClick={
                  generateRecipes
                }
                className="mt-5"
              >
                Generate AI Recipes
              </LoadingButton>

            </div>

            {recipeResult && (
              <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

                <h3 className="mb-4 font-bold text-zinc-100 text-lg flex items-center gap-2">
                  AI Recipe Suggestions
                </h3>

                {getRecipeArray(
                  recipeResult
                ).map(
                  (
                    recipe,
                    index
                  ) => (
                    <div
                      key={`${getRecipeName(
                        recipe
                      )}-${index}`}
                      className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition-all duration-300 hover:border-emerald-500/40"
                    >

                      <h3 className="text-base font-bold text-emerald-400">
                        {getRecipeName(
                          recipe
                        )}
                      </h3>

                      {recipe?.description && (
                        <p className="mt-2 text-sm text-zinc-400 font-medium leading-relaxed">
                          {
                            recipe.description
                          }
                        </p>
                      )}

                      {getRecipeIngredients(
                        recipe
                      ).length >
                        0 && (
                        <div className="mt-4">

                          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Ingredients
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {getRecipeIngredients(
                              recipe
                            ).map(
                              (
                                ingredient
                              ) => (
                                <span
                                  key={
                                    ingredient
                                  }
                                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                                >
                                  {
                                    ingredient
                                  }
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {getRecipeInstructions(
                        recipe
                      ) && (
                        <div className="mt-4">

                          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Instructions
                          </div>

                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300 font-medium">
                            {getRecipeInstructions(
                              recipe
                            )}
                          </p>

                        </div>
                      )}

                    </div>
                  )
                )}

                <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm font-medium text-cyan-300 shadow-inner">
                  Only currently available
                  store products are added
                  to My AI Shopping Plan.
                </div>

                {recipeAvailableProducts.length >
                  0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                    {recipeAvailableProducts.map(
                      (product) => {
                        const productImage =
                          getProductImage(
                            product
                          );

                        const productName =
                          getProductName(
                            product
                          );

                        const productPrice =
                          getProductPrice(
                            product
                          );

                        return (
                          <div
                            key={getProductId(
                              product
                            )}
                            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 transition-all duration-300 hover:border-emerald-500/40"
                          >

                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-1">

                              <ImageWithFallback
                                src={
                                  productImage
                                }
                                alt={
                                  productName
                                }
                                className="h-full w-full object-contain"
                                fallbackClassName="h-full w-full"
                              />

                            </div>

                            <div className="min-w-0">

                              <div className="truncate font-semibold text-zinc-200 text-sm">
                                {
                                  productName
                                }
                              </div>

                              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                                {productPrice >
                                0
                                  ? formatPrice(
                                      productPrice
                                    )
                                  : "Price unavailable"}
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            )}

          </section>
        )}

        {/* ================================================================
            HEALTHY
        ================================================================ */}

        {activeTab ===
          "healthy" && (
          <section>

            <SectionTitle
              emoji="🥗"
              title="Healthy Basket"
              subtitle="Create a balanced grocery basket based on your budget and household size."
            />

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Budget
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      healthyBudget
                    }
                    onChange={(e) =>
                      setHealthyBudget(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    People
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      healthyPeople
                    }
                    onChange={(e) =>
                      setHealthyPeople(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <LoadingButton
                loading={
                  healthyLoading
                }
                onClick={
                  generateHealthyBasket
                }
                className="mt-6"
              >
                Build Healthy Basket
              </LoadingButton>

            </div>

            {healthyResult && (
              <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300 shadow-inner">
                  Healthy grocery plan
                  generated successfully.
                  Available products have
                  been added to your AI plan.
                </div>

              </div>
            )}

          </section>
        )}

  {/* ================================================================
    ADMIN AI TOOLS
================================================================ */}
{isAdmin && activeTab === "tools" && (
  <section className="mt-10">
    <SectionTitle
      emoji="🧠"
      title="AI Tools"
      subtitle="Admin-only AI management and analytics tools."
    />

    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium text-amber-300 shadow-inner">
      🔐 These tools are visible only to administrators.
    </div>

    <div className="grid gap-6 md:grid-cols-2">

      {/* AI PRODUCT SEARCH */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          🔎 AI Product Search
        </h3>

        <div className="mt-4 flex gap-2">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <LoadingButton
            loading={productsLoading}
            onClick={searchProducts}
          >
            Search
          </LoadingButton>
        </div>

        {products.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {products.slice(0, 10).map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
                onAdd={addToAICart}
              />
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT SUBSTITUTION */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          🔁 Product Substitution
        </h3>

        <input
          value={substitutionProductId}
          onChange={(e) =>
            setSubstitutionProductId(e.target.value)
          }
          placeholder="Product ID"
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />

        <LoadingButton
          loading={substitutionLoading}
          onClick={getSubstitution}
          className="mt-4"
        >
          Find Alternatives
        </LoadingButton>

        {substitutionResult && (
  <div className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
    <h4 className="font-bold text-emerald-400 mb-3 text-base">
      Alternative Products
    </h4>

    {substitutionResult?.original && (
      <div className="mb-3 rounded-xl bg-zinc-950 p-3 border border-zinc-800">
        <p className="font-semibold text-zinc-200">
          Original: {substitutionResult.original.name}
        </p>
        <p className="text-zinc-400 mt-1">
          Price: ₹{substitutionResult.original.sellingPrice ?? substitutionResult.original.price ?? "-"}
        </p>
      </div>
    )}

    {substitutionResult?.alternatives?.length > 0 ? (
      <div className="space-y-2">
        {substitutionResult.alternatives.map((product) => (
          <div
            key={product.id}
            className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 transition-all hover:border-emerald-500/40"
          >
            <p className="font-semibold text-zinc-200">
              {product.name}
            </p>

            <p className="text-zinc-400 text-xs mt-1">
              Price: ₹{product.sellingPrice ?? product.price ?? "-"}
            </p>

            <p className="text-emerald-400 text-xs mt-0.5 font-medium">
              Similarity: {product.similarity}%
            </p>

            <p className="text-zinc-500 text-xs mt-0.5">
              Stock: {product.stock ?? 0}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p>No alternatives found.</p>
    )}
  </div>
)}
      </div>

      {/* SMART PRICE */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          💵 Smart Price
        </h3>

        <input
          value={selectedProductId}
          onChange={(e) =>
            setSelectedProductId(e.target.value)
          }
          placeholder="Product ID"
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />

        <LoadingButton
          loading={pricingLoading}
          onClick={getDynamicPricing}
          className="mt-4"
        >
          Calculate Price
        </LoadingButton>

        {pricingResult && (
  <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-zinc-300 shadow-inner">
    <h4 className="font-bold mb-3 text-emerald-400 text-base">
      Smart Price Result
    </h4>

    <div className="space-y-2">
      {Object.entries(pricingResult).map(
        ([key, value]) => (
          <div
            key={key}
            className="flex justify-between gap-4 rounded-xl bg-zinc-950 p-3 border border-zinc-800"
          >
            <span className="font-semibold capitalize text-zinc-300">
              {key.replace(/([A-Z])/g, " $1")}
            </span>

            <span>
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        )
      )}
    </div>
  </div>
)}
      </div>

      {/* DEMAND FORECAST */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          📈 Demand Forecast
        </h3>

        <input
          value={demandProductId}
          onChange={(e) =>
            setDemandProductId(e.target.value)
          }
          placeholder="Product ID"
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />

        <LoadingButton
          loading={demandLoading}
          onClick={getDemandForecast}
          className="mt-4"
        >
          Forecast Demand
        </LoadingButton>

       {demandResult && (
  <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-zinc-300 shadow-inner">
    <h4 className="mb-4 text-lg font-bold text-cyan-400 flex items-center gap-2">
      📈 Demand Forecast Result
    </h4>

    {/* NORMAL VALUES */}
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.entries(demandResult)
        .filter(
          ([key]) =>
            key !== "factors" &&
            key !== "predictions"
        )
        .map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-3"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {key.replace(/([A-Z])/g, " $1")}
            </p>

            <p className="mt-1 font-bold text-zinc-100">
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </p>
          </div>
        ))}
    </div>

    {/* FACTORS */}
    {demandResult?.factors && (
      <div className="mt-5">
        <h5 className="mb-3 text-base font-bold text-zinc-200">
          🎯 Demand Factors
        </h5>

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(demandResult.factors).map(
            ([key, value]) => (
              <div
                key={key}
                className=" rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (c) => c.toUpperCase())}
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-400">
                  {typeof value === "number"
                    ? value.toFixed(2)
                    : String(value)}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    )}

    {/* PREDICTIONS */}
    {Array.isArray(demandResult?.predictions) && (
      <div className="mt-5">
        <h5 className="mb-3 text-base font-bold text-zinc-200">
          📊 7-Day Predictions
        </h5>

        <div className="space-y-2">
          {demandResult.predictions.map(
            (prediction) => (
              <div
                key={prediction.day}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div>
                  <p className="font-semibold text-zinc-200">
                    Day {prediction.day}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">
                    Predicted Demand
                  </p>

                  <p className="text-lg font-bold text-emerald-400">
                    {Number(
                      prediction.predictedDemand
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    )}
  </div>
)}
      </div>

    </div>
  </section>
)}

        {/* ================================================================
            AI SHOPPING PLAN
        ================================================================ */}

        <section className="mt-10">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>

                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  🛒 My AI Shopping Plan
                </h2>

                <p className="mt-1 text-sm text-zinc-400 font-medium">
                  Products selected by AI based
                  on your requirements.
                </p>

              </div>

              <div className="text-right">

                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Estimated Total
                </div>

                <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                  {formatPrice(
                    totalCartPrice
                  )}
                </div>

                <div className="mt-1 text-xs font-medium text-zinc-500">
                  {totalCartQuantity} total
                  item
                  {totalCartQuantity ===
                  1
                    ? ""
                    : "s"}
                </div>

              </div>

            </div>

            {cartItems.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">

                <div className="text-5xl">
                  🛒
                </div>

                <p className="mt-3 font-semibold text-zinc-300">
                  No products
                </p>

                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Generate a basket, recipe,
                  refill plan or add products
                  from recommendations.
                </p>

              </div>
            ) : (
              <div className="mt-6 space-y-3">

                {cartItems.map(
                  (rawItem) => {
                    const item =
                      normalizeAIProduct(
                        rawItem
                      );

                    const id =
                      getProductId(
                        item
                      );

                    if (!id) {
                      return null;
                    }

                    const name =
                      getProductName(
                        item
                      );

                    const price =
                      getProductPrice(
                        item
                      );

                    const quantity =
                      getProductQuantity(
                        item
                      );

                    const image =
                      getProductImage(
                        item
                      );

                    return (
                      <div
                        key={id}
                        className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:border-emerald-500/40 sm:flex-row sm:items-center sm:justify-betwee"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-1">

                            <ImageWithFallback
                              src={
                                image
                              }
                              alt={
                                name
                              }
                              className="h-full w-full object-contain"
                              fallbackClassName="h-full w-full"
                            />

                          </div>

                          <div className="min-w-0">

                            <div className="truncate font-semibold text-zinc-200 text-sm">
                              {name}
                            </div>

                            <div className="text-xs text-zinc-400 mt-0.5">
                              {price >
                              0
                                ? formatPrice(
                                    price
                                  )
                                : "Price unavailable"}{" "}
                              ×{" "}
                              {
                                quantity
                              }
                            </div>

                            <div className="text-xs font-medium text-emerald-400 mt-0.5">
                              Subtotal:{" "}
                              {price >
                              0
                                ? formatPrice(
                                    price *
                                      quantity
                                  )
                                : "Price unavailable"}
                            </div>

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">

                          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  id
                                )
                              }
                              disabled={
                                aiCartLoading
                              }
                              className="px-4 py-2 font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                              −
                            </button>

                            <span className="min-w-[42px] px-2 text-center font-bold text-zinc-200 text-sm">
                              {
                                quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  id
                                )
                              }
                              disabled={
                                aiCartLoading
                              }
                              className="px-4 py-2 font-bold text-emerald-400 hover:bg-zinc-800 transition-colors"
                            >
                              +
                            </button>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromAICart(
                                id
                              )
                            }
                            disabled={
                              aiCartLoading
                            }
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-color"
                          >
                            Remove
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

                <div className="flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Shopping Plan Total
                    </div>

                    <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      {formatPrice(
                        totalCartPrice
                      )}
                    </div>

                    <div className="text-xs font-medium text-zinc-500">
                      {totalCartQuantity} total
                      units
                    </div>

                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        setCartItems(
                          []
                        )
                      }
                      disabled={
                        aiCartLoading
                      }
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Clear Plan
                    </button>

                    <button
                      type="button"
                      onClick={
                        moveAICartToRealCart
                      }
                      disabled={
                        aiCartLoading ||
                        !cartItems.length
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition-all ${
                        aiCartLoading ||
                        !cartItems.length
                          ? "cursor-not-allowed bg-zinc-800 text-zinc-600"
                          : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
        
                      }`}
                    >
                      {aiCartLoading
                        ? "Adding to Cart..."
                        : "Continue to Cart →"}
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
};

export default AIFeatures;