import pg from "pg";
import "../config.js";

const { Pool } = pg;

const database = new Pool({
  connectionString: process.env.SUPABASE_URL,
});

export default database;
