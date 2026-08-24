import prisma from "../config/prisma.js";

export const AddCategoryController = async (request, response) => {
  try {
    const { name, image } = request.body;

    const category = await prisma.category.create({
      data: {
        name,
        image,
      },
    });

    return response.json({
      message: "Add Category",
      success: true,
      error: false,
      data: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const data = await prisma.category.findMany({
      orderBy: {
        name: "asc"
      }
    })

    console.log(data) // check this

    return res.json({
      success: true,
      error: false,
      data
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message
    })
  }
}
export const updateCategoryController = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { id, name, image } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Category id missing",
        success: false,
      });
    }

    const update = await prisma.category.update({
      where: { id },
      data: { name, image },
    });

    return res.json({
      success: true,
      data: update,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Category id missing",
        success: false,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.json({
      message: "Delete category successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};