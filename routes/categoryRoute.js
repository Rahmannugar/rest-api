import express from "express";
import categoryController from "../controllers/categoryController.js";

const router = express.Router();

router.get("/categories", categoryController.getAllCategories);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

export default router;
