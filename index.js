import express from "express";
import "./config.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", categoryRoute);
app.use("/api", productRoute);

app.listen(port, () => console.log(`server started on ${port}`));
