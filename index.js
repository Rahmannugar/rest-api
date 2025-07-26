import express from "express";
import "./config.js";
import pool from "./services/database.js";

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("running server");
});
app.listen(port, () => console.log(`server started on ${port}`));
