import express from "express";
import mongoose from "mongoose";
import authRouter from "./api/auth/routes/authRoutes";
import contactRouter from "./api/routes/contactRoutes";
import organizationRouter from "./api/routes/organizationRoutes";
import departmentRouter from "./api/routes/departmentRoutes";
import productRouter from "./api/routes/productRoutes";
import rolesRouter from "./api/routes/rolesRoute";

const cors = require("cors");
const app = express();

app.use(cors());

app.use(cors({ origin: "http://localhost:3000" }));

const port = process.env.PORT || 4000;

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/roles", rolesRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
