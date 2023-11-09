import prisma from "../prisma/prisma.js";
import jwt from "jsonwebtoken";

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
        is_google: true,
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
