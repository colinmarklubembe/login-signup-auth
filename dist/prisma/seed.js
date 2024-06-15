"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const seedRoles = async () => {
    const roles = ["OWNER", "ADMIN", "SALES", "CUSTOMER_SUPPORT", "MARKETING"];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role },
            update: {},
            create: { name: role },
        });
    }
    console.log("Roles seeded successfully");
};
seedRoles()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
