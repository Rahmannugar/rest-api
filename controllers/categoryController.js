import database from "../services/database.js";

const getAllCategories = async (req, res) => {
  try {
    const result = await database.query("SELECT * FROM category");
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { getAllCategories };
