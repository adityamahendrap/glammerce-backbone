import { PrismaClient } from "@prisma/client";
import authenticate from "../middleware/authenticate.js";
import { Router } from "express";
import validateDto from "../middleware/validateDto.js";
import { addToCartDto } from "../dto/cart.dto.js";
const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const cart = await prisma.shoppingSession.findUnique({
      where: { user_id: req.user.id },
      include: {
        cart_items: {
          orderBy: { created_at: "desc" },
          include: {
            product: {
              include: {
                product_attributes: {
                  include: {
                    product_attribute_values: true,
                  },
                },
                product_combinations: true,
              },
            },
            product_combination: true,
          },
        },
      },
    });

    res.status(200).json({ message: "Cart retrieved", payload: cart });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  authenticate,
  validateDto(addToCartDto),
  async (req, res, next) => {
    const { product_id, quantity, key } = req.body;
    try {
      let shoppingSession = await prisma.shoppingSession.findUnique({
        where: { user_id: req.user.id },
      });

      if (!shoppingSession) {
        shoppingSession = await prisma.shoppingSession.create({
          data: { user_id: req.user.id },
        });
      }

      const { id: product_combination_id } =
        await prisma.productCombination.findFirst({
          where: { product_id, key },
          select: { id: true },
        });
      if (!product_combination_id)
        throw new ResponseError(400, "Product combination not found");

      const cart = await prisma.cartItem.create({
        data: {
          user_id: req.user.id,
          shopping_sessions_id: shoppingSession.id,
          product_id,
          quantity,
          product_combination_id,
        },
      });

      console.log(cart);
      res.status(201).json({ message: "Item added to cart", payload: cart });
    } catch (error) {
      next(error);
    }
  }
);

router.patch("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { key } = req.query;
  try {
    if (key) {
      const { id: product_combination_id } =
        await prisma.productCombination.findFirst({
          where: { product_id: req.body.product_id, key },
          select: { id: true },
        });
      if (!product_combination_id)
        throw new ResponseError(400, "Product combination not found");
      req.body.product_combination_id = product_combination_id;
    }

    const cart = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: req.body,
    });

    res.status(201).json({ message: "Cart updated", payload: cart });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const cart = await prisma.cartItem.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Cart deleted", payload: cart });
  } catch (error) {
    next(error);
  }
});

export default router;
