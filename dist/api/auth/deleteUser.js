"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deleteUserAndRelatedData_1 = __importDefault(require("../../utils/deleteUserAndRelatedData"));
const router = (0, express_1.Router)();
router.delete("/delete-user/:id", async (req, res) => {
    const { id } = req.params;
    const deletedUser = await deleteUserAndRelatedData_1.default.deleteUserAndRelatedData(res, id);
    console.log("User deleted successfully", deletedUser);
});
exports.default = router;
