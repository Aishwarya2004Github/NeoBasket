import React, { useState } from "react";
import {
  FaCloudUploadAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  MdDelete,
  MdInventory2,
} from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";

import uploadImage from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage";
import AddFieldComponent from "../components/AddFieldComponent";

import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  // =========================================================
  // INITIAL PRODUCT DATA
  // =========================================================

  const initialData = {
    name: "",
    image: [],
    category: [],
    subCategory: [],

    // Backend field remains "unit"
    unit: "",

    // Product quantity
    // Example:
    // 1 kg
    // 1 litre
    // 1 dozen
    // 500 gram
    // 250 ml
    // 2 piece
    quantity: "1 kg",

    // Available stock
    stock: "",

    price: "",
    discount: "",
    description: "",
    more_details: {},

    manufacturingDate: "",
    expiryDate: "",
  };

  const [data, setData] = useState(initialData);

  // =========================================================
  // STATES
  // =========================================================

  const [imageLoading, setImageLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [ViewImageURL, setViewImageURL] = useState("");

  const [selectCategory, setSelectCategory] = useState("");

  const [selectSubCategory, setSelectSubCategory] = useState("");

  const [openAddField, setOpenAddField] = useState(false);

  const [fieldName, setFieldName] = useState("");

  // =========================================================
  // REDUX
  // =========================================================

  const allCategory =
    useSelector(
      (state) => state.product.allCategory
    ) || [];

  const allSubCategory =
    useSelector(
      (state) => state.product.allSubCategory
    ) || [];

  // =========================================================
  // SERVER URL
  // =========================================================

  const SERVER_URL = "http://localhost:8080";

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/")
        ? image
        : `/${image}`
    }`;
  };

  // =========================================================
  // NORMAL INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];

    // Reset file input
    e.target.value = "";

    if (!file) {
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    try {
      setImageLoading(true);

      console.log(
        "Uploading:",
        file.name
      );

      const response =
        await uploadImage(file);

      console.log(
        "UPLOAD RESPONSE =>",
        response
      );

      const imagePath =
        response?.data?.data?.url ||
        response?.data?.data?.image ||
        response?.data?.data?.path ||
        response?.data?.url ||
        response?.data?.image ||
        response?.data?.path ||
        "";

      console.log(
        "IMAGE PATH FROM SERVER =>",
        imagePath
      );

      if (!imagePath) {
        throw new Error(
          "Image path not received from server"
        );
      }

      setData((prev) => ({
        ...prev,
        image: [
          ...prev.image,
          imagePath,
        ],
      }));
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR =>",
        error
      );

      console.error(
        "SERVER ERROR =>",
        error?.response?.data
      );

      AxiosToastError(error);
    } finally {
      setImageLoading(false);
    }
  };

  // =========================================================
  // DELETE IMAGE
  // =========================================================

  const handleDeleteImage = (index) => {
    setData((prev) => ({
      ...prev,
      image:
        prev.image.filter(
          (_, imageIndex) =>
            imageIndex !== index
        ),
    }));
  };

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (!value) {
      return;
    }

    const category =
      allCategory.find(
        (item) =>
          (item._id || item.id) === value
      );

    if (!category) {
      return;
    }

    const alreadySelected =
      data.category.some(
        (item) =>
          (item._id || item.id) === value
      );

    if (!alreadySelected) {
      setData((prev) => ({
        ...prev,
        category: [
          ...prev.category,
          category,
        ],
      }));
    }

    setSelectCategory("");
  };

  // =========================================================
  // REMOVE CATEGORY
  // =========================================================

  const handleRemoveCategory = (index) => {
    setData((prev) => ({
      ...prev,
      category:
        prev.category.filter(
          (_, categoryIndex) =>
            categoryIndex !== index
        ),
    }));
  };

  // =========================================================
  // SUB CATEGORY CHANGE
  // =========================================================

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;

    if (!value) {
      return;
    }

    const subCategory =
      allSubCategory.find(
        (item) =>
          (item._id || item.id) === value
      );

    if (!subCategory) {
      return;
    }

    const alreadySelected =
      data.subCategory.some(
        (item) =>
          (item._id || item.id) === value
      );

    if (!alreadySelected) {
      setData((prev) => ({
        ...prev,
        subCategory: [
          ...prev.subCategory,
          subCategory,
        ],
      }));
    }

    setSelectSubCategory("");
  };

  // =========================================================
  // REMOVE SUB CATEGORY
  // =========================================================

  const handleRemoveSubCategory = (index) => {
    setData((prev) => ({
      ...prev,
      subCategory:
        prev.subCategory.filter(
          (_, subCategoryIndex) =>
            subCategoryIndex !== index
        ),
    }));
  };

  // =========================================================
  // ADD MORE FIELD
  // =========================================================

  const handleAddField = () => {
    const cleanFieldName =
      fieldName.trim();

    if (!cleanFieldName) {
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        data.more_details,
        cleanFieldName
      )
    ) {
      alert(
        "This field already exists"
      );

      return;
    }

    setData((prev) => ({
      ...prev,

      more_details: {
        ...prev.more_details,
        [cleanFieldName]: "",
      },
    }));

    setFieldName("");

    setOpenAddField(false);
  };

  // =========================================================
  // UPDATE MORE DETAILS
  // =========================================================

  const handleMoreDetailsChange = (
    key,
    value
  ) => {
    setData((prev) => ({
      ...prev,

      more_details: {
        ...prev.more_details,
        [key]: value,
      },
    }));
  };

  // =========================================================
  // CREATE LOT NUMBER
  // =========================================================

  const getFormattedLotNumber = () => {
    const productName =
      data.name.trim();

    const lotNumber =
      data.unit.trim();

    if (!productName && !lotNumber) {
      return "";
    }

    return `LOT-${productName || "Product"}-${
      lotNumber || "Number"
    }`;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    if (!data.name.trim()) {
      alert(
        "Please enter product name"
      );

      return;
    }

    if (!data.description.trim()) {
      alert(
        "Please enter product description"
      );

      return;
    }

    if (!data.image.length) {
      alert(
        "Please upload at least one image"
      );

      return;
    }

    if (!data.category.length) {
      alert(
        "Please select category"
      );

      return;
    }

    if (!data.subCategory.length) {
      alert(
        "Please select sub category"
      );

      return;
    }

    if (!data.unit.trim()) {
      alert(
        "Please enter lot number"
      );

      return;
    }

    // -------------------------------------------------------
    // QUANTITY VALIDATION
    //
    // IMPORTANT:
    // Quantity is now TEXT.
    //
    // Examples:
    // 1 kg
    // 1 litre
    // 1 dozen
    // 500 gram
    // 250 ml
    // 2 piece
    // -------------------------------------------------------

    if (!data.quantity || !data.quantity.trim()) {
      alert(
        "Please enter product quantity"
      );

      return;
    }

    // -------------------------------------------------------
    // STOCK VALIDATION
    // -------------------------------------------------------

    if (
      data.stock === "" ||
      Number(data.stock) < 0
    ) {
      alert(
        "Please enter valid stock"
      );

      return;
    }

    // -------------------------------------------------------
    // PRICE VALIDATION
    // -------------------------------------------------------

    if (
      data.price === "" ||
      Number(data.price) < 0
    ) {
      alert(
        "Please enter valid price"
      );

      return;
    }

    // -------------------------------------------------------
    // DISCOUNT VALIDATION
    // -------------------------------------------------------

    if (
      data.discount === "" ||
      Number(data.discount) < 0 ||
      Number(data.discount) > 100
    ) {
      alert(
        "Please enter valid discount between 0 and 100"
      );

      return;
    }

    // -------------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------------

    if (
      data.manufacturingDate &&
      data.expiryDate
    ) {
      const manufacturing =
        new Date(
          data.manufacturingDate
        );

      const expiry =
        new Date(
          data.expiryDate
        );

      if (expiry <= manufacturing) {
        alert(
          "Expiry date must be after manufacturing date"
        );

        return;
      }
    }

    // -------------------------------------------------------
    // CATEGORY ID
    // -------------------------------------------------------

    const categoryId =
      data.category?.[0]?._id ||
      data.category?.[0]?.id;

    // -------------------------------------------------------
    // SUB CATEGORY ID
    // -------------------------------------------------------

    const subCategoryId =
      data.subCategory?.[0]?._id ||
      data.subCategory?.[0]?.id;

    if (!categoryId) {
      alert(
        "Invalid category"
      );

      return;
    }

    if (!subCategoryId) {
      alert(
        "Invalid sub category"
      );

      return;
    }

    // -------------------------------------------------------
    // FORMAT LOT NUMBER
    // -------------------------------------------------------

    const formattedLotNumber =
      `LOT-${data.name.trim()}-${data.unit.trim()}`;

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {
      name:
        data.name.trim(),

      image:
        data.image,

      categoryId,

      subCategoryId,

      // Lot Number
      unit:
        formattedLotNumber,

      // =====================================================
      // PRODUCT QUANTITY
      //
      // DO NOT CONVERT TO NUMBER
      //
      // Examples:
      // "1 kg"
      // "1 litre"
      // "1 dozen"
      // "500 gram"
      // "250 ml"
      // =====================================================

      quantity:
        data.quantity.trim(),

      // Available Stock
      stock:
        Number(data.stock || 0),

      price:
        Number(data.price || 0),

      discount:
        Number(data.discount || 0),

      description:
        data.description.trim(),

      more_details:
        data.more_details,

      manufacturingDate:
        data.manufacturingDate
          ? new Date(
              `${data.manufacturingDate}T00:00:00`
            ).toISOString()
          : null,

      expiryDate:
        data.expiryDate
          ? new Date(
              `${data.expiryDate}T00:00:00`
            ).toISOString()
          : null,
    };

    console.log(
      "PRODUCT PAYLOAD =>",
      payload
    );

    // -------------------------------------------------------
    // API CALL
    // -------------------------------------------------------

    try {
      setSubmitLoading(true);

      const response =
        await Axios({
          ...SummaryApi.createProduct,
          data: payload,
        });

      console.log(
        "CREATE PRODUCT RESPONSE =>",
        response
      );

      const responseData =
        response?.data;

      if (responseData?.success) {
        successAlert(
          responseData.message ||
            "Product created successfully"
        );

        // Reset form
        setData({
          ...initialData,
        });

        setSelectCategory("");

        setSelectSubCategory("");
      } else {
        alert(
          responseData?.message ||
            "Product creation failed"
        );
      }
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR =>",
        error
      );

      console.error(
        "SERVER RESPONSE =>",
        error?.response?.data
      );

      AxiosToastError(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">

            <MdInventory2
              size={22}
            />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Upload Product
            </h2>

            <p className="text-xs text-slate-500">
              Add a new product to your store
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          FORM CONTAINER
      ===================================================== */}

      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border p-5 md:p-7 grid gap-6"
        >

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div>

            <h3 className="text-lg font-bold text-slate-800">
              Basic Information
            </h3>

            <p className="text-sm text-slate-500 mb-4">
              Enter product details
            </p>

            <div className="grid gap-4">

              {/* PRODUCT NAME */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="name"
                  className="font-semibold text-sm"
                >
                  Product Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={data.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 border border-slate-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100 outline-none p-3 rounded-xl transition"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="description"
                  className="font-semibold text-sm"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter product description"
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="bg-slate-50 border border-slate-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100 outline-none p-3 rounded-xl resize-none transition"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <div>

                <h3 className="font-bold text-slate-800">
                  Product Images
                </h3>

                <p className="text-xs text-slate-500">
                  Upload one or more product images
                </p>

              </div>

              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">

                {data.image.length} image
                {data.image.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>

            {/* UPLOAD BOX */}

            <label
              htmlFor="productImage"
              className="group bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-300 hover:border-primary-200 min-h-32 rounded-2xl flex justify-center items-center cursor-pointer transition"
            >

              <div className="text-center">

                {imageLoading ? (
                  <Loading />
                ) : (
                  <>
                    <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">

                      <FaCloudUploadAlt
                        size={25}
                        className="text-primary-200"
                      />

                    </div>

                    <p className="font-semibold text-slate-700">
                      Click to upload image
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, JPEG • Max 5MB
                    </p>
                  </>
                )}

              </div>

              <input
                type="file"
                id="productImage"
                className="hidden"
                accept="image/*"
                onChange={handleUploadImage}
                disabled={imageLoading}
              />

            </label>

            {/* IMAGE PREVIEW */}

            {data.image.length > 0 && (

              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">

                {data.image.map(
                  (img, index) => (

                    <div
                      key={`${img}-${index}`}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 border relative group"
                    >

                      <img
                        src={getImageUrl(img)}
                        alt={`product-${index}`}
                        className="w-full h-full object-cover cursor-pointer transition group-hover:scale-105"
                        onClick={() =>
                          setViewImageURL(
                            getImageUrl(img)
                          )
                        }
                        onError={() => {
                          console.error(
                            "IMAGE LOAD ERROR:",
                            getImageUrl(img)
                          );
                        }}
                      />

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteImage(index)
                        }
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >

                        <MdDelete
                          size={18}
                        />

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* =================================================
              CATEGORY + SUB CATEGORY
          ================================================= */}

          <div className="grid md:grid-cols-2 gap-5">

            {/* CATEGORY */}

            <div>

              <label className="font-semibold text-sm">
                Category
              </label>

              <select
                value={selectCategory}
                onChange={handleCategoryChange}
                className="mt-1.5 bg-slate-50 border border-slate-200 w-full p-3 rounded-xl outline-none focus:border-primary-200"
              >

                <option value="">
                  Select Category
                </option>

                {allCategory.map(
                  (category) => (

                    <option
                      key={
                        category._id ||
                        category.id
                      }
                      value={
                        category._id ||
                        category.id
                      }
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

              <div className="flex flex-wrap gap-2 mt-2">

                {data.category.map(
                  (category, index) => (

                    <div
                      key={
                        (category._id ||
                          category.id) +
                        index
                      }
                      className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-sm"
                    >

                      <span>
                        {category.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveCategory(
                            index
                          )
                        }
                        className="text-slate-500 hover:text-red-500"
                      >

                        <IoClose
                          size={18}
                        />

                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* SUB CATEGORY */}

            <div>

              <label className="font-semibold text-sm">
                Sub Category
              </label>

              <select
                value={selectSubCategory}
                onChange={
                  handleSubCategoryChange
                }
                className="mt-1.5 bg-slate-50 border border-slate-200 w-full p-3 rounded-xl outline-none focus:border-primary-200"
              >

                <option value="">
                  Select Sub Category
                </option>

                {allSubCategory.map(
                  (subCategory) => (

                    <option
                      key={
                        subCategory._id ||
                        subCategory.id
                      }
                      value={
                        subCategory._id ||
                        subCategory.id
                      }
                    >
                      {subCategory.name}
                    </option>

                  )
                )}

              </select>

              <div className="flex flex-wrap gap-2 mt-2">

                {data.subCategory.map(
                  (subCategory, index) => (

                    <div
                      key={
                        (subCategory._id ||
                          subCategory.id) +
                        index
                      }
                      className="flex items-center gap-1 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full text-sm"
                    >

                      <span>
                        {subCategory.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSubCategory(
                            index
                          )
                        }
                        className="text-slate-500 hover:text-red-500"
                      >

                        <IoClose
                          size={18}
                        />

                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              INVENTORY & PRICING
          ================================================= */}

          <div>

            <h3 className="font-bold text-slate-800 mb-4">
              Inventory & Pricing
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* LOT NUMBER */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="unit"
                  className="font-semibold text-sm"
                >
                  Lot Number
                </label>

                <input
                  id="unit"
                  type="text"
                  name="unit"
                  placeholder="e.g. 25"
                  value={data.unit}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

                {/* PREVIEW */}

                <p className="text-xs text-slate-400">

                  Saved as:{" "}

                  <span className="font-semibold text-slate-600">

                    {getFormattedLotNumber() ||
                      "LOT-ProductName-Number"}

                  </span>

                </p>

              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="quantity"
                  className="font-semibold text-sm"
                >
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="text"
                  name="quantity"
                  placeholder="e.g. 1 kg, 1 litre, 1 dozen"
                  value={data.quantity}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

                <p className="text-xs text-slate-400">
                  Enter quantity with unit, e.g. 1 kg, 1 litre, 1 dozen
                </p>

              </div>

              {/* STOCK */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="stock"
                  className="font-semibold text-sm"
                >
                  Stock
                </label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  name="stock"
                  placeholder="0"
                  value={data.stock}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

              </div>

              {/* PRICE */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="price"
                  className="font-semibold text-sm"
                >
                  Price
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  placeholder="₹ 0"
                  value={data.price}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

              </div>

              {/* DISCOUNT */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="discount"
                  className="font-semibold text-sm"
                >
                  Discount %
                </label>

                <input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  name="discount"
                  placeholder="0"
                  value={data.discount}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCT DATES
          ================================================= */}

          <div>

            <h3 className="font-bold text-slate-800 mb-1">
              Product Dates
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              Add manufacturing and expiry information
            </p>

            <div className="grid md:grid-cols-2 gap-4">

              {/* MANUFACTURING DATE */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="manufacturingDate"
                  className="font-semibold text-sm flex items-center gap-2"
                >

                  <FaCalendarAlt
                    className="text-primary-200"
                  />

                  Manufacturing Date

                </label>

                <input
                  id="manufacturingDate"
                  type="date"
                  name="manufacturingDate"
                  value={
                    data.manufacturingDate
                  }
                  onChange={handleChange}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

              </div>

              {/* EXPIRY DATE */}

              <div className="grid gap-1.5">

                <label
                  htmlFor="expiryDate"
                  className="font-semibold text-sm flex items-center gap-2"
                >

                  <FaCalendarAlt
                    className="text-red-400"
                  />

                  Expiry Date

                </label>

                <input
                  id="expiryDate"
                  type="date"
                  name="expiryDate"
                  min={
                    data.manufacturingDate ||
                    undefined
                  }
                  value={
                    data.expiryDate
                  }
                  onChange={handleChange}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              MORE DETAILS
          ================================================= */}

          {Object.keys(
            data.more_details
          ).length > 0 && (

            <div>

              <h3 className="font-bold text-slate-800 mb-4">
                Additional Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                {Object.keys(
                  data.more_details
                ).map((key) => (

                  <div
                    key={key}
                    className="grid gap-1.5"
                  >

                    <label
                      htmlFor={key}
                      className="font-semibold text-sm"
                    >
                      {key}
                    </label>

                    <input
                      id={key}
                      type="text"
                      value={
                        data.more_details[key]
                      }
                      onChange={(e) =>
                        handleMoreDetailsChange(
                          key,
                          e.target.value
                        )
                      }
                      required
                      className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-primary-200"
                    />

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* =================================================
              ADD FIELD
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setOpenAddField(true)
            }
            className="w-fit px-4 py-2 border border-primary-200 text-primary-200 hover:bg-primary-100 rounded-xl font-semibold transition"
          >
            + Add More Field
          </button>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="pt-3 border-t">

            <button
              type="submit"
              disabled={
                submitLoading ||
                imageLoading
              }
              className="w-full bg-primary-100 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition"
            >

              {submitLoading
                ? "Creating Product..."
                : "Create Product"}

            </button>

          </div>

        </form>

      </div>

      {/* =====================================================
          IMAGE VIEW
      ===================================================== */}

      {ViewImageURL && (

        <ViewImage
          url={ViewImageURL}
          close={() =>
            setViewImageURL("")
          }
        />

      )}

      {/* =====================================================
          ADD FIELD MODAL
      ===================================================== */}

      {openAddField && (

        <AddFieldComponent
          value={fieldName}
          onChange={(e) =>
            setFieldName(
              e.target.value
            )
          }
          submit={handleAddField}
          close={() =>
            setOpenAddField(false)
          }
        />

      )}

    </section>
  );
};

export default UploadProduct;