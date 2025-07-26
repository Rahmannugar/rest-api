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

const createProduct = async (req, res) => {
  try {
    //validate the request body
    if (!req.body.name || !req.body.price || !req.body.category_id) {
      return res
        .status(422)
        .json({ error: "Name, price, and category_id are required" });
    }

    const existingCategory = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE id = $1)",
      values: [req.body.category_id],
    });

    const categoryExists = existingCategory.rows[0].exists;
    if (!categoryExists) {
      return res.status(404).json({ error: "Category does not exist" });
    }

    //check if the product already exists
    const existingProduct = await database.query({
      text: "SELECT EXISTS (SELECT * FROM product WHERE name = $1 AND category_id = $2)",
      values: [req.body.name, req.body.category_id],
    });
    const productExists = existingProduct.rows[0].exists;
    if (productExists) {
      return res.status(409).json({ error: "Product already exists" });
    }

    //insert the new product
    const result = await database.query({
      text: `INSERT INTO product (name, description, price, currency, quantity, active, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [
        req.body.name,
        req.body.description ? req.body.description : null,
        req.body.price,
        req.body.currency ? req.body.currency : "USD",
        req.body.quantity ? req.body.quantity : 0,
        "active" in req.body ? req.body.active : true,
        req.body.category_id,
      ],
    });
    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { getAllProducts, createProduct };
