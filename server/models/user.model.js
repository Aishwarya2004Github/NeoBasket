import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Compatibility export
const UserModel = {
  findOne: async ({ email }) => {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  create: async (data) => {
    return await prisma.user.create({
      data
    });
  },

  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
};

export default UserModel;