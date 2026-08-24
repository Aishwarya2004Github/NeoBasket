import prisma from "../config/prisma.js";

const admin = async (request, response, next) => {
  try {
    const userId = request.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.role !== "ADMIN") {
      return response.status(403).json({
        message: "Access denied. Admin only",
        error: true,
        success: false,
      });
    }

    next();
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export default admin;