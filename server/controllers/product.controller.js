import prisma from "../config/prisma.js";

/*
=========================================================
HELPER : STOCK INFO
=========================================================
*/

const getStockInfo = (stock) => {
  const currentStock = Math.max(
    0,
    Number(stock ?? 0)
  );

  return {
    stock: currentStock,

    isOutOfStock:
      currentStock <= 0,

    stockStatus:
      currentStock <= 0
        ? "OUT_OF_STOCK"
        : currentStock <= 5
        ? "LOW_STOCK"
        : "IN_STOCK",
  };
};


/*
=========================================================
HELPER : PARSE DATE
=========================================================

Accepts:
- 2026-08-24
- 2026-08-24T00:00:00.000Z
- Date object

Returns:
- Date
- null
*/

const parseOptionalDate = (
  value,
  fieldName
) => {
  /*
  Empty value means null
  */

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsedDate =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid date`
    );
  }

  return parsedDate;
};


/*
=========================================================
HELPER : DATE VALIDATION
=========================================================
*/

const validateProductDates = (
  manufacturingDate,
  expiryDate
) => {
  if (
    manufacturingDate &&
    expiryDate &&
    expiryDate < manufacturingDate
  ) {
    throw new Error(
      "Expiry date cannot be before manufacturing date"
    );
  }
};


/*
=========================================================
CREATE PRODUCT
=========================================================
*/

export const createProductController =
  async (
    request,
    response
  ) => {
    try {
      const {
        name,
        image,
        categoryId,
        subCategoryId,
        unit,
        stock,
        price,
        discount,
        description,
        more_details,

        /*
        IMPORTANT
        */

        manufacturingDate,
        expiryDate,
      } = request.body;


      /*
      =====================================================
      REQUIRED FIELDS
      =====================================================
      */

      if (
        !name ||
        !Array.isArray(image) ||
        image.length === 0 ||
        !categoryId ||
        !subCategoryId ||
        !unit ||
        price === undefined ||
        price === null ||
        !description
      ) {
        return response.status(400).json({
          message:
            "Enter required fields",

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      STOCK
      =====================================================
      */

      const parsedStock =
        Number(stock ?? 0);

      if (
        !Number.isFinite(
          parsedStock
        ) ||
        parsedStock < 0
      ) {
        return response.status(400).json({
          message:
            "Stock must be a valid number",

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      PRICE
      =====================================================
      */

      const parsedPrice =
        Number(price);

      if (
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      ) {
        return response.status(400).json({
          message:
            "Price must be a valid number",

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      DISCOUNT
      =====================================================
      */

      const parsedDiscount =
        Number(discount ?? 0);

      if (
        !Number.isFinite(
          parsedDiscount
        ) ||
        parsedDiscount < 0
      ) {
        return response.status(400).json({
          message:
            "Discount must be a valid number",

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      PARSE MANUFACTURING DATE
      =====================================================
      */

      let parsedManufacturingDate;

      try {
        parsedManufacturingDate =
          parseOptionalDate(
            manufacturingDate,
            "Manufacturing date"
          );
      } catch (dateError) {
        return response.status(400).json({
          message:
            dateError.message,

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      PARSE EXPIRY DATE
      =====================================================
      */

      let parsedExpiryDate;

      try {
        parsedExpiryDate =
          parseOptionalDate(
            expiryDate,
            "Expiry date"
          );
      } catch (dateError) {
        return response.status(400).json({
          message:
            dateError.message,

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      DATE VALIDATION
      =====================================================
      */

      try {
        validateProductDates(
          parsedManufacturingDate,
          parsedExpiryDate
        );
      } catch (dateError) {
        return response.status(400).json({
          message:
            dateError.message,

          error: true,
          success: false,
        });
      }


      /*
      =====================================================
      FINAL STOCK
      =====================================================
      */

      const finalStock =
        Math.floor(
          parsedStock
        );


      /*
      =====================================================
      CREATE PRODUCT
      =====================================================
      */

      const saveProduct =
        await prisma.product.create({
          data: {
            name,

            image,

            categoryId,

            subCategoryId,

            unit,

            stock:
              finalStock,

            price:
              parsedPrice,

            discount:
              parsedDiscount,

            description,

            more_details:
              more_details ?? null,

            /*
            ===============================================
            IMPORTANT
            DATABASE DATE FIELDS
            ===============================================
            */

            manufacturingDate:
              parsedManufacturingDate,

            expiryDate:
              parsedExpiryDate,

            /*
            ===============================================
            AUTOMATIC PUBLISH
            ===============================================
            */

            publish:
              finalStock > 0,
          },

          include: {
            category: true,

            subCategory: true,
          },
        });


      /*
      =====================================================
      RESPONSE
      =====================================================
      */

      return response.json({
        message:
          "Product Created Successfully",

        data: {
          ...saveProduct,

          ...getStockInfo(
            saveProduct.stock
          ),
        },

        error: false,

        success: true,
      });

    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to create product",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
GET ALL PRODUCTS
=========================================================
*/

export const getProductController =
  async (
    request,
    response
  ) => {
    try {
      let {
        page = 1,
        limit = 10,
        search = "",
      } = request.body;


      page = Number(page);

      limit = Number(limit);


      if (
        !Number.isFinite(page) ||
        page < 1
      ) {
        page = 1;
      }


      if (
        !Number.isFinite(limit) ||
        limit < 1
      ) {
        limit = 10;
      }


      page =
        Math.floor(page);

      limit =
        Math.floor(limit);


      const skip =
        (page - 1) *
        limit;


      const searchText =
        String(
          search ?? ""
        ).trim();


      const where =
        searchText
          ? {
              name: {
                contains:
                  searchText,

                mode:
                  "insensitive",
              },
            }
          : {};


      const [
        products,
        totalCount,
      ] =
        await Promise.all([
          prisma.product.findMany({
            where,

            skip,

            take: limit,

            orderBy: {
              createdAt:
                "desc",
            },

            include: {
              category: true,

              subCategory: true,
            },
          }),

          prisma.product.count({
            where,
          }),
        ]);


      const data =
        products.map(
          (product) => ({
            ...product,

            ...getStockInfo(
              product.stock
            ),
          })
        );


      return response.json({
        message:
          "Product data",

        error: false,

        success: true,

        totalCount,

        totalNoPage:
          Math.ceil(
            totalCount /
              limit
          ),

        page,

        limit,

        data,
      });

    } catch (error) {
      console.error(
        "GET PRODUCTS ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to get products",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
GET PRODUCT BY CATEGORY
=========================================================
*/

export const getProductByCategory =
  async (
    request,
    response
  ) => {
    try {
      const { id } =
        request.body;


      if (!id) {
        return response.status(400).json({
          message:
            "Provide category id",

          error: true,

          success: false,
        });
      }


      const products =
        await prisma.product.findMany({
          where: {
            categoryId: id,

            publish: true,

            stock: {
              gt: 0,
            },
          },

          take: 15,

          orderBy: {
            createdAt:
              "desc",
          },
        });


      const data =
        products.map(
          (product) => ({
            ...product,

            ...getStockInfo(
              product.stock
            ),
          })
        );


      return response.json({
        message:
          "Category product list",

        data,

        error: false,

        success: true,
      });

    } catch (error) {
      console.error(
        "GET CATEGORY PRODUCTS ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to get category products",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
GET PRODUCT BY CATEGORY + SUBCATEGORY
=========================================================
*/

export const getProductByCategoryAndSubCategory =
  async (
    request,
    response
  ) => {
    try {
      const {
        categoryId,
        subCategoryId,
      } = request.body;


      if (
        !categoryId ||
        !subCategoryId
      ) {
        return response.status(400).json({
          success: false,

          error: true,

          message:
            "Category ID and SubCategory ID are required",
        });
      }


      const products =
        await prisma.product.findMany({
          where: {
            categoryId,

            subCategoryId,

            publish: true,

            stock: {
              gt: 0,
            },
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });


      const data =
        products.map(
          (product) => ({
            ...product,

            ...getStockInfo(
              product.stock
            ),
          })
        );


      return response.json({
        success: true,

        error: false,

        data,
      });

    } catch (error) {
      console.error(
        "CATEGORY SUBCATEGORY PRODUCT ERROR:",
        error
      );

      return response.status(500).json({
        success: false,

        error: true,

        message:
          error?.message ||
          "Unable to get products",
      });
    }
  };


/*
=========================================================
GET PRODUCT DETAILS
=========================================================
*/

export const getProductDetails =
  async (
    request,
    response
  ) => {
    try {
      const {
        productId,
      } = request.body;


      if (!productId) {
        return response.status(400).json({
          message:
            "Provide productId",

          error: true,

          success: false,
        });
      }


      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },

          include: {
            category: true,

            subCategory: true,
          },
        });


      if (!product) {
        return response.status(404).json({
          message:
            "Product not found",

          error: true,

          success: false,
        });
      }


      return response.json({
        message:
          "Product details",

        data: {
          ...product,

          /*
          ===============================================
          THESE TWO FIELDS WILL COME FROM DATABASE
          ===============================================
          */

          manufacturingDate:
            product.manufacturingDate,

          expiryDate:
            product.expiryDate,

          ...getStockInfo(
            product.stock
          ),
        },

        error: false,

        success: true,
      });

    } catch (error) {
      console.error(
        "GET PRODUCT DETAILS ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to get product",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
UPDATE PRODUCT
=========================================================
*/

export const updateProductDetails =
  async (
    request,
    response
  ) => {
    try {
      const {
        id,
        ...rest
      } = request.body;


      if (!id) {
        return response.status(400).json({
          message:
            "Provide product id",

          error: true,

          success: false,
        });
      }


      /*
      =====================================================
      FIND EXISTING PRODUCT
      =====================================================
      */

      const existingProduct =
        await prisma.product.findUnique({
          where: {
            id,
          },
        });


      if (!existingProduct) {
        return response.status(404).json({
          message:
            "Product not found",

          error: true,

          success: false,
        });
      }


      /*
      =====================================================
      STOCK
      =====================================================
      */

      const parsedStock =
        rest.stock !== undefined &&
        rest.stock !== null &&
        rest.stock !== ""
          ? Number(rest.stock)
          : Number(
              existingProduct.stock ??
                0
            );


      if (
        !Number.isFinite(
          parsedStock
        ) ||
        parsedStock < 0
      ) {
        return response.status(400).json({
          message:
            "Stock must be a valid number",

          error: true,

          success: false,
        });
      }


      const finalStock =
        Math.floor(
          parsedStock
        );


      /*
      =====================================================
      PRICE
      =====================================================
      */

      const parsedPrice =
        rest.price !== undefined &&
        rest.price !== null &&
        rest.price !== ""
          ? Number(rest.price)
          : Number(
              existingProduct.price ??
                0
            );


      if (
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      ) {
        return response.status(400).json({
          message:
            "Price must be a valid number",

          error: true,

          success: false,
        });
      }


      /*
      =====================================================
      DISCOUNT
      =====================================================
      */

      const parsedDiscount =
        rest.discount !== undefined &&
        rest.discount !== null &&
        rest.discount !== ""
          ? Number(rest.discount)
          : Number(
              existingProduct.discount ??
                0
            );


      if (
        !Number.isFinite(
          parsedDiscount
        ) ||
        parsedDiscount < 0
      ) {
        return response.status(400).json({
          message:
            "Discount must be a valid number",

          error: true,

          success: false,
        });
      }


      /*
      =====================================================
      MANUFACTURING DATE
      =====================================================
      
      IMPORTANT:

      If frontend sends:
      manufacturingDate: "2026-08-20"

      then it gets converted to Date.

      If frontend does not send manufacturingDate,
      existing database value remains unchanged.
      */

      let parsedManufacturingDate =
        existingProduct.manufacturingDate;


      if (
        Object.prototype.hasOwnProperty.call(
          rest,
          "manufacturingDate"
        )
      ) {
        try {
          parsedManufacturingDate =
            parseOptionalDate(
              rest.manufacturingDate,
              "Manufacturing date"
            );
        } catch (dateError) {
          return response.status(400).json({
            message:
              dateError.message,

            error: true,

            success: false,
          });
        }
      }


      /*
      =====================================================
      EXPIRY DATE
      =====================================================
      */

      let parsedExpiryDate =
        existingProduct.expiryDate;


      if (
        Object.prototype.hasOwnProperty.call(
          rest,
          "expiryDate"
        )
      ) {
        try {
          parsedExpiryDate =
            parseOptionalDate(
              rest.expiryDate,
              "Expiry date"
            );
        } catch (dateError) {
          return response.status(400).json({
            message:
              dateError.message,

            error: true,

            success: false,
          });
        }
      }


      /*
      =====================================================
      DATE VALIDATION
      =====================================================
      */

      try {
        validateProductDates(
          parsedManufacturingDate,
          parsedExpiryDate
        );
      } catch (dateError) {
        return response.status(400).json({
          message:
            dateError.message,

          error: true,

          success: false,
        });
      }


      /*
      =====================================================
      UPDATE PRODUCT
      =====================================================
      */

      const updateProduct =
        await prisma.product.update({
          where: {
            id,
          },

          data: {
            name:
              rest.name ??
              existingProduct.name,


            image:
              rest.image ??
              existingProduct.image,


            categoryId:
              rest.categoryId ??
              existingProduct.categoryId,


            subCategoryId:
              rest.subCategoryId ??
              existingProduct.subCategoryId,


            unit:
              rest.unit ??
              existingProduct.unit,


            stock:
              finalStock,


            price:
              parsedPrice,


            discount:
              parsedDiscount,


            description:
              rest.description ??
              existingProduct.description,


            more_details:
              rest.more_details ??
              existingProduct.more_details,


            /*
            ===============================================
            IMPORTANT DATE FIELDS
            ===============================================
            */

            manufacturingDate:
              parsedManufacturingDate,


            expiryDate:
              parsedExpiryDate,


            /*
            ===============================================
            AUTOMATIC PUBLISH
            ===============================================
            */

            publish:
              finalStock > 0,
          },

          include: {
            category: true,

            subCategory: true,
          },
        });


      /*
      =====================================================
      RESPONSE
      =====================================================
      */

      return response.json({
        message:
          finalStock > 0
            ? "Product updated and back in stock"
            : "Product updated and marked out of stock",

        data: {
          ...updateProduct,

          manufacturingDate:
            updateProduct.manufacturingDate,

          expiryDate:
            updateProduct.expiryDate,

          ...getStockInfo(
            updateProduct.stock
          ),
        },

        error: false,

        success: true,
      });

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to update product",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
DELETE PRODUCT
=========================================================
*/

export const deleteProductDetails =
  async (
    request,
    response
  ) => {
    try {
      const { id } =
        request.body;


      if (!id) {
        return response.status(400).json({
          message:
            "Provide product id",

          error: true,

          success: false,
        });
      }


      const existingProduct =
        await prisma.product.findUnique({
          where: {
            id,
          },
        });


      if (!existingProduct) {
        return response.status(404).json({
          message:
            "Product not found",

          error: true,

          success: false,
        });
      }


      const deleteProduct =
        await prisma.product.delete({
          where: {
            id,
          },
        });


      return response.json({
        message:
          "Delete successfully",

        error: false,

        success: true,

        data:
          deleteProduct,
      });

    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to delete product",

        error: true,

        success: false,
      });
    }
  };


/*
=========================================================
SEARCH PRODUCT
=========================================================
*/

export const searchProduct =
  async (
    request,
    response
  ) => {
    try {
      let {
        search = "",
        page = 1,
        limit = 10,
      } = request.body;


      page = Number(page);

      limit = Number(limit);


      if (
        !Number.isFinite(page) ||
        page < 1
      ) {
        page = 1;
      }


      if (
        !Number.isFinite(limit) ||
        limit < 1
      ) {
        limit = 10;
      }


      page =
        Math.floor(page);

      limit =
        Math.floor(limit);


      const skip =
        (page - 1) *
        limit;


      const searchText =
        String(
          search ?? ""
        ).trim();


      const where = {
        name: {
          contains:
            searchText,

          mode:
            "insensitive",
        },
      };


      const [
        products,
        dataCount,
      ] =
        await Promise.all([
          prisma.product.findMany({
            where,

            skip,

            take: limit,

            orderBy: {
              createdAt:
                "desc",
            },

            include: {
              category: true,

              subCategory: true,
            },
          }),

          prisma.product.count({
            where,
          }),
        ]);


      const data =
        products.map(
          (product) => ({
            ...product,

            ...getStockInfo(
              product.stock
            ),
          })
        );


      return response.json({
        message:
          "Product data",

        error: false,

        success: true,

        data,

        totalCount:
          dataCount,

        totalPage:
          Math.ceil(
            dataCount /
              limit
          ),

        page,

        limit,
      });

    } catch (error) {
      console.error(
        "SEARCH PRODUCT ERROR:",
        error
      );

      return response.status(500).json({
        message:
          error?.message ||
          "Unable to search products",

        error: true,

        success: false,
      });
    }
  };