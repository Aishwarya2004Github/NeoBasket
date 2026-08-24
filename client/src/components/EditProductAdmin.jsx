import React, { useEffect, useMemo, useState } from "react";
import { FaCloudUploadAlt, FaCalendarAlt } from "react-icons/fa";
import uploadImage from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import AddFieldComponent from "../components/AddFieldComponent";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";

const EditProductAdmin = ({
    close,
    data: propsData,
    fetchProductData,
}) => {

    /* =========================================================
       HELPERS
    ========================================================= */

    const getId = (item) => {
        if (!item) return "";
        return item?._id || item?.id || "";
    };

    const formatDateForInput = (date) => {
        if (!date) return "";

        try {
            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return "";
            }

            return parsedDate.toISOString().split("T")[0];
        } catch {
            return "";
        }
    };

    /* =========================================================
       GET LOT NUMBER FROM UNIT
    ========================================================= */

    const getLotNumberFromUnit = (unit) => {
        if (!unit) return "";

        const value = String(unit).trim();

        if (!value.toUpperCase().startsWith("LOT-")) {
            return value;
        }

        const parts = value.split("-");

        if (parts.length >= 3) {
            return parts.slice(2).join("-");
        }

        return "";
    };

    /* =========================================================
       INITIAL LOT NUMBER
    ========================================================= */

    const initialLotNumber = useMemo(() => {
        return getLotNumberFromUnit(propsData?.unit);
    }, [propsData?.unit]);

    /* =========================================================
       INITIAL DATA
    ========================================================= */

    const createInitialData = () => ({
        id: propsData?.id || "",

        name: propsData?.name || "",

        image: Array.isArray(propsData?.image)
            ? propsData.image
            : [],

        category: propsData?.category || null,

        subCategory: propsData?.subCategory || null,

        unit: propsData?.unit || "",

        lotNumber: initialLotNumber,

        /* =====================================================
           QUANTITY
           NOW STRING
           Example: 1 kg / 1 litre / 1 dozen
        ===================================================== */

        quantity:
            propsData?.quantity !== null &&
            propsData?.quantity !== undefined
                ? String(propsData.quantity)
                : "",

        stock: propsData?.stock ?? "",

        price: propsData?.price ?? "",

        discount: propsData?.discount ?? "",

        description: propsData?.description || "",

        more_details:
            propsData?.more_details &&
            typeof propsData.more_details === "object"
                ? propsData.more_details
                : {},

        manufacturingDate: formatDateForInput(
            propsData?.manufacturingDate
        ),

        expiryDate: formatDateForInput(
            propsData?.expiryDate
        ),
    });

    const [data, setData] = useState(createInitialData);

    /* =========================================================
       STATES
    ========================================================= */

    const [imageLoading, setImageLoading] = useState(false);

    const [ViewImageURL, setViewImageURL] = useState("");

    const [selectCategory, setSelectCategory] = useState("");

    const [selectSubCategory, setSelectSubCategory] =
        useState("");

    const [openAddField, setOpenAddField] =
        useState(false);

    const [fieldName, setFieldName] = useState("");

    /* =========================================================
       REDUX
    ========================================================= */

    const allCategory =
        useSelector(
            (state) => state.product.allCategory || []
        );

    const allSubCategory =
        useSelector(
            (state) => state.product.allSubCategory || []
        );

    /* =========================================================
       SYNC DATA WHEN PROPS CHANGE
    ========================================================= */

    useEffect(() => {
        setData({
            id: propsData?.id || "",

            name: propsData?.name || "",

            image: Array.isArray(propsData?.image)
                ? propsData.image
                : [],

            category: propsData?.category || null,

            subCategory: propsData?.subCategory || null,

            unit: propsData?.unit || "",

            lotNumber: getLotNumberFromUnit(
                propsData?.unit
            ),

            quantity:
                propsData?.quantity !== null &&
                propsData?.quantity !== undefined
                    ? String(propsData.quantity)
                    : "",

            stock: propsData?.stock ?? "",

            price: propsData?.price ?? "",

            discount: propsData?.discount ?? "",

            description: propsData?.description || "",

            more_details:
                propsData?.more_details &&
                typeof propsData.more_details === "object"
                    ? propsData.more_details
                    : {},

            manufacturingDate: formatDateForInput(
                propsData?.manufacturingDate
            ),

            expiryDate: formatDateForInput(
                propsData?.expiryDate
            ),
        });
    }, [propsData]);

    /* =========================================================
       HANDLE NORMAL INPUT
    ========================================================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =========================================================
       HANDLE LOT NUMBER
    ========================================================= */

    const handleLotNumberChange = (e) => {
        const value = e.target.value;

        setData((prev) => ({
            ...prev,
            lotNumber: value,
        }));
    };

    /* =========================================================
       CREATE LOT VALUE
    ========================================================= */

    const generateLotValue = () => {
        const productName = String(
            data.name || ""
        ).trim();

        const lotNumber = String(
            data.lotNumber || ""
        ).trim();

        if (!productName || !lotNumber) {
            return "";
        }

        return `LOT-${productName}-${lotNumber}`;
    };

    const lotPreview = generateLotValue();

    /* =========================================================
       UPLOAD IMAGE
    ========================================================= */

    const handleUploadImage = async (e) => {
        try {
            const file = e.target.files?.[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                return;
            }

            setImageLoading(true);

            const response = await uploadImage(file);

            const imageUrl =
                response?.data?.data?.url ||
                response?.data?.data?.image ||
                response?.data?.data?.path ||
                response?.data?.url ||
                response?.data?.image ||
                response?.data?.path ||
                "";

            if (!imageUrl) {
                throw new Error("Image upload failed");
            }

            setData((prev) => ({
                ...prev,

                image: [
                    ...(Array.isArray(prev.image)
                        ? prev.image
                        : []),
                    imageUrl,
                ],
            }));
        } catch (error) {
            console.error(
                "IMAGE UPLOAD ERROR:",
                error
            );

            AxiosToastError(error);
        } finally {
            setImageLoading(false);

            if (e.target) {
                e.target.value = "";
            }
        }
    };

    /* =========================================================
       DELETE IMAGE
    ========================================================= */

    const handleDeleteImage = (index) => {
        setData((prev) => ({
            ...prev,

            image: prev.image.filter(
                (_, i) => i !== index
            ),
        }));
    };

    /* =========================================================
       CATEGORY CHANGE
    ========================================================= */

    const handleCategoryChange = (e) => {
        const value = e.target.value;

        if (!value) {
            return;
        }

        const category =
            allCategory.find(
                (item) =>
                    String(
                        item?._id || item?.id
                    ) === String(value)
            );

        if (!category) {
            return;
        }

        setData((prev) => ({
            ...prev,

            category,

            subCategory: null,
        }));

        setSelectCategory("");
    };

    /* =========================================================
       SUB CATEGORY CHANGE
    ========================================================= */

    const handleSubCategoryChange = (e) => {
        const value = e.target.value;

        if (!value) {
            return;
        }

        const subCategory =
            allSubCategory.find(
                (item) =>
                    String(
                        item?._id || item?.id
                    ) === String(value)
            );

        if (!subCategory) {
            return;
        }

        setData((prev) => ({
            ...prev,
            subCategory,
        }));

        setSelectSubCategory("");
    };

    /* =========================================================
       ADD MORE FIELD
    ========================================================= */

    const handleAddField = () => {
        const cleanFieldName =
            fieldName.trim();

        if (!cleanFieldName) {
            return;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                data.more_details || {},
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
                ...(prev.more_details || {}),
                [cleanFieldName]: "",
            },
        }));

        setFieldName("");

        setOpenAddField(false);
    };

    /* =========================================================
       SUBMIT UPDATE
    ========================================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            /* =================================================
               BASIC VALIDATION
            ================================================= */

            if (!data.id) {
                throw new Error(
                    "Product ID is missing"
                );
            }

            if (!data.name.trim()) {
                throw new Error(
                    "Product name is required"
                );
            }

            const categoryId = getId(
                data.category
            );

            const subCategoryId = getId(
                data.subCategory
            );

            if (!categoryId) {
                throw new Error(
                    "Please select category"
                );
            }

            if (!subCategoryId) {
                throw new Error(
                    "Please select sub category"
                );
            }

            /* =================================================
               LOT NUMBER VALIDATION
            ================================================= */

            if (
                !String(
                    data.lotNumber
                ).trim()
            ) {
                throw new Error(
                    "Lot number is required"
                );
            }

            /* =================================================
               QUANTITY VALIDATION
               
               Quantity is now TEXT.
               
               Examples:
               1 kg
               1 litre
               500 ml
               1 dozen
            ================================================= */

            if (
                !String(
                    data.quantity || ""
                ).trim()
            ) {
                throw new Error(
                    "Quantity is required"
                );
            }

            /* =================================================
               STOCK VALIDATION
            ================================================= */

            if (
                data.stock === "" ||
                Number(data.stock) < 0
            ) {
                throw new Error(
                    "Stock must be 0 or greater"
                );
            }

            /* =================================================
               DATE VALIDATION
            ================================================= */

            if (
                data.manufacturingDate &&
                data.expiryDate
            ) {
                const manufacturing =
                    new Date(
                        `${data.manufacturingDate}T00:00:00`
                    );

                const expiry =
                    new Date(
                        `${data.expiryDate}T00:00:00`
                    );

                if (
                    manufacturing >= expiry
                ) {
                    throw new Error(
                        "Expiry date must be after manufacturing date"
                    );
                }
            }

            /* =================================================
               GENERATE UNIT / LOT
            ================================================= */

            const finalUnit =
                generateLotValue();

            if (!finalUnit) {
                throw new Error(
                    "Unable to generate lot number"
                );
            }

            /* =================================================
               PAYLOAD
            ================================================= */

            const payload = {
                id: data.id,

                name: data.name.trim(),

                image: Array.isArray(data.image)
                    ? data.image
                    : [],

                categoryId,

                subCategoryId,

                unit: finalUnit,

                /* =================================================
                   QUANTITY

                   STRING VALUE

                   Examples:
                   "1 kg"
                   "1 litre"
                   "1 dozen"
                ================================================= */

                quantity:
                    String(
                        data.quantity || ""
                    ).trim(),

                /* =================================================
                   STOCK
                ================================================= */

                stock:
                    data.stock === ""
                        ? 0
                        : Number(data.stock),

                /* =================================================
                   PRICE
                ================================================= */

                price:
                    data.price === ""
                        ? 0
                        : Number(data.price),

                /* =================================================
                   DISCOUNT
                ================================================= */

                discount:
                    data.discount === ""
                        ? 0
                        : Number(data.discount),

                description:
                    data.description.trim(),

                more_details:
                    data.more_details || {},

                manufacturingDate:
                    data.manufacturingDate
                        ? new Date(
                            `${data.manufacturingDate}T00:00:00.000Z`
                        ).toISOString()
                        : null,

                expiryDate:
                    data.expiryDate
                        ? new Date(
                            `${data.expiryDate}T00:00:00.000Z`
                        ).toISOString()
                        : null,
            };

            console.log(
                "UPDATE PRODUCT PAYLOAD:",
                payload
            );

            /* =================================================
               API CALL
            ================================================= */

            const response =
                await Axios({
                    ...SummaryApi.updateProductDetails,
                    data: payload,
                });

            const responseData =
                response?.data;

            if (responseData?.success) {
                successAlert(
                    responseData.message ||
                    "Product updated successfully"
                );

                if (close) {
                    close();
                }

                if (fetchProductData) {
                    fetchProductData();
                }
            } else {
                throw new Error(
                    responseData?.message ||
                    "Product update failed"
                );
            }
        } catch (error) {
            console.error(
                "UPDATE PRODUCT FRONTEND ERROR:",
                error
            );

            AxiosToastError(error);
        }
    };

    /* =========================================================
       RETURN
    ========================================================= */

    return (
        <section className="fixed inset-0 bg-neutral-900/70 z-50 p-4 flex items-center justify-center backdrop-blur-sm">

            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-neutral-100">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">

                    <div>
                        <h2 className="font-bold text-lg text-neutral-800">
                            Edit Product
                        </h2>

                        <p className="text-xs text-neutral-500 mt-0.5">
                            Update product, quantity, stock, lot and expiry details
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={close}
                        className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        <IoClose size={22} />
                    </button>

                </div>

                {/* =================================================
                    SCROLL CONTENT
                ================================================= */}

                <div className="overflow-y-auto p-6">

                    <form
                        className="grid gap-5"
                        onSubmit={handleSubmit}
                    >

                        {/* =================================================
                            PRODUCT NAME
                        ================================================= */}

                        <div className="grid gap-1.5">

                            <label
                                htmlFor="name"
                                className="text-sm font-semibold text-neutral-700"
                            >
                                Product Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Enter product name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none text-neutral-800"
                            />

                        </div>

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div className="grid gap-1.5">

                            <label
                                htmlFor="description"
                                className="text-sm font-semibold text-neutral-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                placeholder="Enter product description"
                                name="description"
                                value={data.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none resize-none"
                            />

                        </div>

                        {/* =================================================
                            IMAGE
                        ================================================= */}

                        <div className="grid gap-2">

                            <p className="text-sm font-semibold text-neutral-700">
                                Product Images
                            </p>

                            <div className="grid grid-cols-4 gap-3">

                                <label
                                    htmlFor="productImage"
                                    className="h-20 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col justify-center items-center cursor-pointer bg-neutral-50 hover:bg-neutral-100"
                                >

                                    {imageLoading ? (
                                        <Loading />
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt
                                                size={28}
                                                className="text-neutral-400"
                                            />

                                            <p className="text-xs font-medium mt-0.5">
                                                Upload Image
                                            </p>
                                        </>
                                    )}

                                    <input
                                        type="file"
                                        id="productImage"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={
                                            handleUploadImage
                                        }
                                        disabled={imageLoading}
                                    />

                                </label>

                                {data.image.map(
                                    (img, index) => (
                                        <div
                                            key={
                                                img + index
                                            }
                                            className="h-20 w-full bg-neutral-50 border border-neutral-200 rounded-lg relative group overflow-hidden"
                                        >

                                            <img
                                                src={
                                                    img?.startsWith(
                                                        "http"
                                                    )
                                                        ? img
                                                        : `http://localhost:8080${img}`
                                                }
                                                alt="product"
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() =>
                                                    setViewImageURL(
                                                        img?.startsWith(
                                                            "http"
                                                        )
                                                            ? img
                                                            : `http://localhost:8080${img}`
                                                    )
                                                }
                                            />

                                            <div
                                                onClick={() =>
                                                    handleDeleteImage(
                                                        index
                                                    )
                                                }
                                                className="absolute inset-0 bg-black/40 items-center justify-center text-white hidden group-hover:flex cursor-pointer"
                                            >
                                                <MdDelete
                                                    size={18}
                                                    className="text-red-400"
                                                />
                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                        {/* =================================================
                            CATEGORY
                        ================================================= */}

                        <div className="grid gap-1.5">

                            <label className="text-sm font-semibold text-neutral-700">
                                Category
                            </label>

                            <select
                                className="bg-neutral-50 border border-neutral-200 w-full p-2 rounded-lg outline-none focus:border-blue-500 text-sm"
                                value={selectCategory}
                                onChange={
                                    handleCategoryChange
                                }
                            >

                                <option value="">
                                    Select Category
                                </option>

                                {allCategory.map(
                                    (c, index) => (
                                        <option
                                            key={
                                                c?._id ||
                                                c?.id ||
                                                index
                                            }
                                            value={
                                                c?._id ||
                                                c?.id ||
                                                ""
                                            }
                                        >
                                            {c.name}
                                        </option>
                                    )
                                )}

                            </select>

                            {data.category && (
                                <div className="text-xs inline-flex w-fit items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                                    {data.category.name}
                                </div>
                            )}

                        </div>

                        {/* =================================================
                            SUB CATEGORY
                        ================================================= */}

                        <div className="grid gap-1.5">

                            <label className="text-sm font-semibold text-neutral-700">
                                Sub Category
                            </label>

                            <select
                                className="bg-neutral-50 border border-neutral-200 w-full p-2 rounded-lg outline-none focus:border-blue-500 text-sm"
                                value={selectSubCategory}
                                onChange={
                                    handleSubCategoryChange
                                }
                            >

                                <option value="">
                                    Select Sub Category
                                </option>

                                {allSubCategory.map(
                                    (c, index) => (
                                        <option
                                            key={
                                                c?._id ||
                                                c?.id ||
                                                index
                                            }
                                            value={
                                                c?._id ||
                                                c?.id ||
                                                ""
                                            }
                                        >
                                            {c.name}
                                        </option>
                                    )
                                )}

                            </select>

                            {data.subCategory && (
                                <div className="text-xs inline-flex w-fit items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-medium">
                                    {data.subCategory.name}
                                </div>
                            )}

                        </div>

                        {/* =================================================
                            INVENTORY
                        ================================================= */}

                        <div>

                            <h3 className="text-sm font-bold text-neutral-800 mb-3">
                                Inventory & Lot
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                {/* LOT NUMBER */}

                                <div className="grid gap-1.5">

                                    <label
                                        htmlFor="lotNumber"
                                        className="text-sm font-semibold text-neutral-700"
                                    >
                                        Lot Number
                                    </label>

                                    <input
                                        id="lotNumber"
                                        type="text"
                                        placeholder="e.g. 001"
                                        name="lotNumber"
                                        value={data.lotNumber}
                                        onChange={
                                            handleLotNumberChange
                                        }
                                        required
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                    />

                                    <p className="text-[11px] text-neutral-500">
                                        Backend unit value:
                                    </p>

                                    <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold break-all">
                                        {lotPreview ||
                                            "LOT-ProductName-Number"}
                                    </div>

                                </div>

                                {/* =================================================
                                    QUANTITY
                                ================================================= */}

                                <div className="grid gap-1.5">

                                    <label
                                        htmlFor="quantity"
                                        className="text-sm font-semibold text-neutral-700"
                                    >
                                        Quantity
                                    </label>

                                    <input
                                        id="quantity"
                                        type="text"
                                        placeholder="e.g. 1 kg, 1 litre, 1 dozen"
                                        name="quantity"
                                        value={data.quantity}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                    />

                                    <p className="text-[11px] text-neutral-500">
                                        Example: 1 kg, 1 litre, 500 ml, 1 dozen
                                    </p>

                                </div>

                                {/* STOCK */}

                                <div className="grid gap-1.5">

                                    <label
                                        htmlFor="stock"
                                        className="text-sm font-semibold text-neutral-700"
                                    >
                                        Stock
                                    </label>

                                    <input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        placeholder="Stock"
                                        name="stock"
                                        value={data.stock}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                    />

                                    <p className="text-[11px] text-neutral-500">
                                        Available stock
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            PRICE + DISCOUNT
                        ================================================= */}

                        <div className="grid grid-cols-2 gap-3">

                            {/* PRICE */}

                            <div className="grid gap-1.5">

                                <label
                                    htmlFor="price"
                                    className="text-sm font-semibold text-neutral-700"
                                >
                                    Price
                                </label>

                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Price"
                                    name="price"
                                    value={data.price}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                />

                            </div>

                            {/* DISCOUNT */}

                            <div className="grid gap-1.5">

                                <label
                                    htmlFor="discount"
                                    className="text-sm font-semibold text-neutral-700"
                                >
                                    Discount
                                </label>

                                <input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Discount"
                                    name="discount"
                                    value={data.discount}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                />

                            </div>

                        </div>

                        {/* =================================================
                            DATES
                        ================================================= */}

                        <div>

                            <div className="flex items-center gap-2 mb-3">

                                <FaCalendarAlt className="text-blue-500" />

                                <h3 className="text-sm font-bold text-neutral-800">
                                    Product Dates
                                </h3>

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* MANUFACTURING DATE */}

                                <div className="grid gap-1.5">

                                    <label
                                        htmlFor="manufacturingDate"
                                        className="text-sm font-semibold text-neutral-700"
                                    >
                                        Manufacturing Date
                                    </label>

                                    <input
                                        id="manufacturingDate"
                                        type="date"
                                        name="manufacturingDate"
                                        value={
                                            data.manufacturingDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none text-sm text-neutral-800"
                                    />

                                </div>

                                {/* EXPIRY DATE */}

                                <div className="grid gap-1.5">

                                    <label
                                        htmlFor="expiryDate"
                                        className="text-sm font-semibold text-neutral-700"
                                    >
                                        Expiry Date
                                    </label>

                                    <input
                                        id="expiryDate"
                                        type="date"
                                        name="expiryDate"
                                        value={
                                            data.expiryDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min={
                                            data.manufacturingDate ||
                                            undefined
                                        }
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:bg-white rounded-lg outline-none text-sm text-neutral-800"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            DYNAMIC MORE DETAILS
                        ================================================= */}

                        {Object.keys(
                            data.more_details || {}
                        ).map(
                            (key, index) => (
                                <div
                                    key={
                                        key + index
                                    }
                                    className="grid gap-1.5"
                                >

                                    <label
                                        htmlFor={key}
                                        className="text-sm font-semibold text-neutral-700 capitalize"
                                    >
                                        {key}
                                    </label>

                                    <input
                                        id={key}
                                        type="text"
                                        value={
                                            data.more_details[
                                                key
                                            ]
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            setData((prev) => ({
                                                ...prev,

                                                more_details: {
                                                    ...prev.more_details,

                                                    [key]: value,
                                                },
                                            }));
                                        }}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-blue-500 rounded-lg outline-none text-sm"
                                    />

                                </div>
                            )
                        )}

                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="flex gap-3 pt-4 border-t border-neutral-100 mt-2">

                            <button
                                type="button"
                                onClick={() =>
                                    setOpenAddField(true)
                                }
                                className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg"
                            >
                                Add Fields
                            </button>

                            <button
                                type="submit"
                                disabled={imageLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm"
                            >
                                Update Product
                            </button>

                        </div>

                    </form>

                </div>

                {/* =================================================
                    VIEW IMAGE
                ================================================= */}

                {ViewImageURL && (
                    <ViewImage
                        url={ViewImageURL}
                        close={() =>
                            setViewImageURL("")
                        }
                    />
                )}

                {/* =================================================
                    ADD FIELD
                ================================================= */}

                {openAddField && (
                    <AddFieldComponent
                        value={fieldName}
                        onChange={(e) =>
                            setFieldName(
                                e.target.value
                            )
                        }
                        submit={
                            handleAddField
                        }
                        close={() =>
                            setOpenAddField(
                                false
                            )
                        }
                    />
                )}

            </div>

        </section>
    );
};

export default EditProductAdmin;