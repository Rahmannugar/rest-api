import database from "../services/database.js";

const getAllCategories = async (req, res) => {
  try {
    const result = await database.query(
      "SELECT * FROM category ORDER BY id ASC"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    //configure request details
    let { name } = req.body;

    //validate the request body
    if (!name) {
      return res.status(422).json({ error: "Category name is required" });
    }

    name = name.trim().toLowerCase();

    //first check if the category already exists
    const existingCategory = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE name = $1)",
      values: [name],
    });
    const categoryExists = existingCategory.rows[0].exists;
    if (categoryExists) {
      return res.status(409).json({ error: "Category already exists" });
    }
    //insert the new category
    const result = await database.query({
      text: "INSERT INTO category (name) VALUES ($1) RETURNING *",
      values: [name],
    });
    return res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    //configure request details
    const categoryId = req.params.id;
    let { name } = req.body;

    //validate the request body
    if (!name) {
      return res.status(422).json({ error: "Category name is required" });
    }

    name = name.trim().toLowerCase();

    //check if category does not exist
    const categoryCheck = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE id = $1)",
      values: [categoryId],
    });

    const categoryExists = categoryCheck.rows[0].exists;
    if (!categoryExists) {
      return res.status(404).json({ error: "Category not found" });
    }

    //check if the category exists already
    const existingCategory = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE name = $1 AND id != $2)",
      values: [name, categoryId],
    });

    const categoryExistAlready = existingCategory.rows[0].exists;
    if (categoryExistAlready) {
      return res
        .status(409)
        .json({ error: `Category ${name} already exists in database` });
    }

    //update the category
    const result = await database.query({
      text: `UPDATE category
      SET name = $1, updated_date = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *`,
      values: [name, categoryId],
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    //configure request details
    const categoryId = req.params.id;

    //check if the category exists
    const categoryCheck = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE id = $1)",
      values: [categoryId],
    });
    if (!categoryCheck.rows[0].exists) {
      return res.status(404).json({ error: "Category not found" });
    }

    //check if the category has products
    const productCheck = await database.query({
      text: "SELECT COUNT(*) FROM product WHERE category_id = $1",
      values: [categoryId],
    });
    if (productCheck.rows[0].count > 0) {
      return res.status(409).json({
        error: "Cannot delete category with existing products",
      });
    }

    await database.query({
      text: "DELETE FROM category WHERE id = $1 RETURNING *",
      values: [categoryId],
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
