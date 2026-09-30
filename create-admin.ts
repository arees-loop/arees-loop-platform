import { hash } from "bcryptjs";

import { prisma } from "./lib/prisma";

async function main() {
  const email = "admin@areesloop.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required");
  }

  if (password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 8 characters"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (existingUser) {
    console.log(
      `Admin account already exists: ${existingUser.email} (${existingUser.role})`
    );
    return;
  }

  const passwordHash = await hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: "Arees Loop",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("SUPER_ADMIN created successfully:");
  console.table([admin]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });