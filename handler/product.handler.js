import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json({
      message: "Products retrieved",
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/:slug", async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: {
      id: req.params.id,
      slug: req.params.slug,
    },
    include: {
      product_attributes: {
        include: {
          product_attribute_values: true,
        },
      },
      product_combinations: true,
    },
  });
  res.status(200).json({
    message: "Product retrieved",
    data: product,
  });
});

export default router;
