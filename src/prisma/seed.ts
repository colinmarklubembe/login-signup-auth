import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
