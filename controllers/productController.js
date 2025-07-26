import database from "../services/database.js";

const getAllProducts = async (req, res) => {
  try {
    const result =
      await database.query(`SELECT p.id, p.name, p.description, p.price, p.currency,
p.quantity, p.active, p.created_date, p.updated_date,

(SELECT ROW_TO_JSON (category_obj) FROM(
SELECT id, name FROM  category WHERE id = p.category_id
) category_obj) AS category

FROM product p`);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { getAllProducts };
