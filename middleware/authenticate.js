import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import ResponseError from "../helper/response_erorr.js";
const prisma = new PrismaClient();

export default async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new ResponseError(400, "Token not found");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) {
      throw new ResponseError(400, `Invalid token`);
    }
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
