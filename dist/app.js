"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const forgotPassword_1 = __importDefault(require("./api/auth/forgotPassword"));
const changePassword_1 = __importDefault(require("./api/auth/changePassword"));
const organizationRoutes_1 = __importDefault(require("./api/routes/organizationRoutes"));
const departmentRoutes_1 = __importDefault(require("./api/routes/departmentRoutes"));
const login_1 = __importDefault(require("./api/auth/login"));
const signup_1 = __importDefault(require("./api/auth/owner/signup"));
const verifyUser_1 = __importDefault(require("./api/auth/verifyUser"));
const inviteUsers_1 = __importDefault(require("./api/auth/owner/inviteUsers"));
const refreshToken_1 = __importDefault(require("./api/auth/refreshToken"));
const productRoutes_1 = __importDefault(require("./api/routes/productRoutes"));
const updateProfile_1 = __importDefault(require("./api/auth/updateProfile"));
const rolesRoute_1 = __importDefault(require("./api/routes/rolesRoute"));
const deleteUser_1 = __importDefault(require("./api/auth/deleteUser"));
const cors = require("cors");
const app = (0, express_1.default)();
app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));
const port = process.env.PORT || 4000;
mongoose_1.default
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
app.use(express_1.default.json());
app.use("/api/v1/auth", signup_1.default);
app.use("/api/v1/auth", verifyUser_1.default);
app.use("/api/v1/users", forgotPassword_1.default);
app.use("/api/v1/users", changePassword_1.default);
app.use("/api/v1/auth", login_1.default);
app.use("/api/v1/organizations", organizationRoutes_1.default);
app.use("/api/v1/users", inviteUsers_1.default);
app.use("/api/v1/departments", departmentRoutes_1.default);
app.use("/ap1/v1/tokens", refreshToken_1.default);
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/users", updateProfile_1.default);
app.use("/api/v1/roles", rolesRoute_1.default);
app.use("/api/v1/users", deleteUser_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
