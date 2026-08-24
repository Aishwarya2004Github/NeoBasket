import prisma from "../config/prisma.js";

export const addAddressController = async (request, response) => {
  try {
    const userId = request.userId;

    const {
      address_line,
      city,
      state,
      pincode,
      country,
      mobile
    } = request.body;

    const saveAddress = await prisma.address.create({
      data: {
        address_line,
        city,
        state,
        pincode,
        country,
        mobile,
        userId
      }
    });

    return response.json({
      message: "Address Created Successfully",
      error: false,
      success: true,
      data: saveAddress
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const getAddressController = async (request, response) => {
  try {
    const userId = request.userId;

    const data = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return response.json({
      data,
      message: "List of address",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateAddressController = async (request, response) => {
  try {

    console.log("BODY =", request.body)

    const { _id, address_line, city, state, country, pincode, mobile } =
      request.body;

    if (!_id) {
      return response.status(400).json({
        message: "_id missing"
      })
    }

    const updateAddress = await prisma.address.update({
      where: {
        id: _id,
      },
      data: {
        address_line,
        city,
        state,
        country,
        pincode,
        mobile,
      },
    });

    return response.json({
      message: "Address Updated",
      success: true,
      data: updateAddress,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const deleteAddresscontroller = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "_id missing",
        success: false
      });
    }

    const disableAddress = await prisma.address.update({
      where: {
        id: _id,   // ✅ यही सही है
      },
      data: {
        status: false,
      },
    });

    return response.json({
      message: "Address removed",
      success: true,
      data: disableAddress,
    });

  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
    });
  }
};