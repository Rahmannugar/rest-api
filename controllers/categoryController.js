import database from "../services/database.js";

const getAllCategories = async (req, res) => {
  try {
    const result = await database.query("SELECT * FROM category");
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    //validate the request body
    if (!req.body.name) {
      return res.status(422).json({ error: "Category name is required" });
    }
    //first check if the category already exists
    const existingCategory = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE name = $1)",
      values: [req.body.name],
    });
    const categoryExists = existingCategory.rows[0].exists;
    if (categoryExists) {
      return res.status(409).json({ error: "Category already exists" });
    }
    //insert the new category
    const result = await database.query({
      text: "INSERT INTO category (name) VALUES ($1) RETURNING *",
      values: [req.body.name],
    });
    return res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { getAllCategories, createCategory };
