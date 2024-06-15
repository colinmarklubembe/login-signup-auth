"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const deleteUserAndRelatedData = async (res, id) => {
    try {
        // check if user exists
        const user = await client_1.default.user.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({ error: "User does not exist" });
        }
        // start a transaction
        await client_1.default.$transaction([
            client_1.default.userOrganizationRole.deleteMany({
                where: {
                    userId: user.id,
                },
            }),
            client_1.default.userDepartment.deleteMany({
                where: {
                    userId: user.id,
                },
            }),
            client_1.default.user.delete({
                where: {
                    id: user.id,
                },
            }),
        ]);
        res.status(200).json({ message: "User and related data deleted" });
    }
    catch (error) {
        console.error("Error deleting user and related data", error);
        res.status(500).send("Error deleting user and related data");
    }
};
exports.default = { deleteUserAndRelatedData };
