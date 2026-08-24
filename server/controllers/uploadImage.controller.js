import uploadImageLocal from "../utils/uploadImageLocal.js";

const uploadImageController = async (request, response) => {
  try {
    const file = request.file;

    console.log("REQUEST FILE:", file);

    if (!file) {
      return response.status(400).json({
        message: "No image file received",
        success: false,
        error: true,
      });
    }

    const uploadImage = await uploadImageLocal(file);

    return response.status(200).json({
      message: "Upload done",
      data: uploadImage,
      success: true,
      error: false,
    });
  } catch (error) {
    console.log("IMAGE CONTROLLER ERROR:", error);

    return response.status(500).json({
      message: error.message || "Image upload failed",
      error: true,
      success: false,
    });
  }
};

export default uploadImageController;