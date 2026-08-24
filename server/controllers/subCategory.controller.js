import prisma from "../config/prisma.js";

export const AddSubCategoryController = async (req, res) => {
  try {
    console.log("BODY RECEIVED =>", req.body);
    const { name, image, categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category id missing",
        success: false,
      });
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        image,
        category: {
          connect: { id: categoryId }   // 🔥 BEST PRACTICE
        }
      },
    });

    return res.json({
      message: "Sub Category Added",
      success: true,
      data: subCategory,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const getSubCategoryController = async (req,res)=>{
   try{

      const data = await prisma.subCategory.findMany({
         include:{
            category:true
         }
      })

      console.log(JSON.stringify(data,null,2))

      return res.json({
         success:true,
         data
      })

   }catch(error){
      return res.status(500).json({
         success:false,
         message:error.message
      })
   }
}

export const updateSubCategoryController = async (req, res) => {
  try {

    console.log("BODY RECEIVED:", req.body)

    const { id, name, image, categoryId } = req.body

    const update = await prisma.subCategory.update({
      where: {
        id
      },
      data: {
        name,
        image,
        categoryId
      }
    })

    return res.json({
      success: true,
      message: "Sub Category Updated",
      data: update
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const deleteSubCategoryController = async (request, response) => {
  try {
    const { id } = request.body;

    await prisma.subCategory.delete({
      where: {
        id
      },
    });

    return response.json({
      message: "Sub Category Deleted",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};