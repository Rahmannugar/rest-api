import database from "../services/database.js";

const getAllProducts = async (req, res) => {
  try {
    const result =
      await database.query(`SELECT p.id, p.name, p.description, p.price, p.currency,
p.quantity, p.active, p.created_date, p.updated_date,

(SELECT ROW_TO_JSON (category_obj) FROM(
SELECT id, name FROM  category WHERE id = p.category_id
) category_obj) AS category

FROM product p ORDER BY p.id ASC`);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    //configure namecase
    let name = req.body.name;

    //validate the request body
    if (!name || !req.body.price || !req.body.category_id) {
      return res
        .status(422)
        .json({ error: "Name, price, and category_id are required" });
    }
    name = name.trim().toLowerCase();

    const existingCategory = await database.query({
      text: "SELECT EXISTS (SELECT * FROM category WHERE id = $1)",
      values: [req.body.category_id],
    });

    const categoryExists = existingCategory.rows[0].exists;
    if (!categoryExists) {
      return res.status(404).json({ error: "Category does not exist" });
    }

    // Check if product name exists globally (in any category)
    const globalNameCheck = await database.query({
      text: "SELECT category_id FROM product WHERE name = $1",
      values: [name],
    });

    if (globalNameCheck.rowCount > 0) {
      const existingCategoryId = globalNameCheck.rows[0].category_id;
      if (existingCategoryId !== req.body.category_id) {
        return res.status(409).json({
          error: `Product name '${name}' already exists in a different category.`,
        });
      } else {
        return res.status(409).json({
          error: `Product '${name}' already exists in this category.`,
        });
      }
    }

    //insert the new product
    const result = await database.query({
      text: `INSERT INTO product (name, description, price, currency, quantity, active, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      values: [
        name,
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

const updateProduct = async (req, res) => {
  try {
    //validate the request body
    if (Object.keys(req.body).length === 0) {
      return res.status(422).json({ error: "Invalid or null details" });
    }

    const productId = req.params.id;
    let { name, description, price, currency, quantity, active, category_id } =
      req.body;

    if (!name || !category_id) {
      return res
        .status(422)
        .json({ error: "Name and category_id are required" });
    }

    //configure namecase
    name = name.trim().toLowerCase();

    //check if the product exists
    const existingProduct = await database.query({
      text: "SELECT * FROM product WHERE id = $1",
      values: [productId],
    });

    if (existingProduct.rowCount === 0) {
      return res.status(404).json({
        error: `Product not found`,
      });
    }

    // Check if the new name exists in other products (excluding the one being updated)
    const conflictingProduct = await database.query({
      text: "SELECT * FROM product WHERE name = $1 AND id != $2",
      values: [name, productId],
    });

    if (conflictingProduct.rowCount > 0) {
      const conflict = conflictingProduct.rows[0];
      if (conflict.category_id !== category_id) {
        return res.status(409).json({
          error: `Product '${name}' already exists in a different category.`,
        });
      } else {
        return res.status(409).json({
          error: `Product '${name}' already exists in this category.`,
        });
      }
    }

    //update the product
    const result = await database.query({
      text: `UPDATE product SET name = $1, description = $2, price = $3, currency = $4,
      quantity = $5, active = $6, category_id = $7, updated_date = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
      values: [
        name,
        description,
        price,
        currency ? currency : "USD",
        quantity,
        active,
        category_id,
        productId,
      ],
    });
    return res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    //configure request details
    const productId = req.params.id;

    //check if the product exists
    const productCheck = await database.query({
      text: "SELECT EXISTS (SELECT * FROM product WHERE id = $1)",
      values: [productId],
    });
    if (!productCheck.rows[0].exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    //delete the product
    await database.query({
      text: "DELETE FROM product WHERE id = $1 RETURNING *",
      values: [productId],
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default { getAllProducts, createProduct, updateProduct, deleteProduct };
