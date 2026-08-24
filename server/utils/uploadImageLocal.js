import fs from "fs";
import path from "path";

const uploadImageLocal = async (image) => {
  try {
    if (!image) {
      throw new Error("Image file not found");
    }

    // Multer diskStorage ke case mein path hota hai
    if (!image.path) {
      throw new Error("Image path not found in multer file");
    }

    const fileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(image.originalname);

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "products"
    );

    fs.mkdirSync(uploadDir, { recursive: true });

    const newPath = path.join(uploadDir, fileName);

    // multer ne jis temporary location par file save ki hai,
    // wahan se products folder mein move/copy karo
    fs.copyFileSync(image.path, newPath);

    // temporary file delete
    fs.unlinkSync(image.path);

    console.log("IMAGE SAVED:", newPath);

    return {
      url: `/uploads/products/${fileName}`,
      fileName,
    };

  } catch (error) {
    console.log("LOCAL IMAGE UPLOAD ERROR:", error);
    throw error;
  }
};

export default uploadImageLocal;