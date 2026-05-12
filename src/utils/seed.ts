import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

import { config } from "../config/env";
import { Role } from "../../generated/prisma/enums";

export const seedAdmin = async () => {
  try {
    const isExistDemoBuyer = await prisma.user.findFirst({
      where: {
        email: config.DEMO_BUYER_EMAIL,
      },
    });

    const isExistDemoSeller = await prisma.user.findFirst({
      where: {
        email: config.DEMO_SELLER_EMAIL,
      },
    });

    const isAdminExist = await prisma.user.findFirst({
      where: {
        email: config.ADMIN_EMAIL,
      },
    });

    if (isAdminExist) {
      console.log("admin exist. Skipping seeding admin.");
      return;
    }

    if (isExistDemoBuyer) {
      console.log("Demo buyer exist. Skipping seeding demo buyer.");
      return;
    }

    if (isExistDemoSeller) {
      console.log("Demo seller exist. Skipping seeding demo seller.");
      return;
    }

    const adminUser = await auth.api.signUpEmail({
      body: {
        email: config.ADMIN_EMAIL as string,
        password: config.ADMIN_PASSWORD as string,
        name: config.ADMIN_NAME || "PropAI Admin",
      },
    });

    const demoSeller = await auth.api.signUpEmail({
      body: {
        email: config.DEMO_SELLER_EMAIL as string,
        password: config.DEMO_SELLER_PASSWORD as string,
        name: config.DEMO_SELLER_NAME || "PropAI Seller",
      },
    });

    const demoBuyer = await auth.api.signUpEmail({
      body: {
        email: config.DEMO_BUYER_EMAIL as string,
        password: config.DEMO_BUYER_PASSWORD as string,
        name: config.DEMO_BUYER_NAME || "PropAI Buyer",
      },
    });

    console.log(adminUser);
    console.log(demoSeller);
    console.log(demoBuyer);

    const admin = await prisma.user.findUniqueOrThrow({
      where: {
        email: config.ADMIN_EMAIL as string,
      },
    });

    const seller = await prisma.user.findUniqueOrThrow({
      where: {
        email: config.DEMO_SELLER_EMAIL as string,
      },
    });

    const buyer = await prisma.user.findUniqueOrThrow({
      where: {
        email: config.DEMO_BUYER_EMAIL as string,
      },
    });

    if (admin) {
      await prisma.user.update({
        where: {
          email: config.ADMIN_EMAIL as string,
        },
        data: {
          role: Role.ADMIN,
        },
      });
    }

    if (seller) {
      await prisma.user.update({
        where: {
          email: config.DEMO_SELLER_EMAIL as string,
        },
        data: {
          role: Role.SELLER,
        },
      });
    }

    if (buyer) {
      await prisma.user.update({
        where: {
          email: config.DEMO_BUYER_EMAIL as string,
        },
        data: {
          role: Role.BUYER,
        },
      });
    }

    console.log("Admin created,", admin);
    console.log("Seller created,", seller);
    console.log("Buyer created,", buyer);
  } catch (error) {
    console.error("Error seeding super admin: ", error);

    await prisma.user.deleteMany({
      where: {
        email: config.ADMIN_EMAIL as string,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: config.DEMO_SELLER_EMAIL as string,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: config.DEMO_BUYER_EMAIL as string,
      },
    });
  }
};
