import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { hashSync, genSaltSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import ResponseError from "../helper/response_erorr.js";
import validateDto from "../middleware/validateDto.js";
import { loginDto, registerDto } from "../dto/auth.dto.js";
import authenticate from "../middleware/authenticate.js";
const router = Router();
const prisma = new PrismaClient();

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified_at: true,
        phone_number: true,
        provider: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(200).json({
      message: "User retrieved",
      payload: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", validateDto(registerDto), async (req, res, next) => {
  const { name, email, password, confirm_password } = req.body;
  try {
    if (password !== confirm_password)
      throw new ResponseError(400, "Password confirmation not match");

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) throw new ResponseError(400, "User already registered");

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    res.status(201).json({
      message: "User registered",
      payload: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validateDto(loginDto), async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ResponseError(400, "User not registered");

    const isPasswordMatch = compareSync(password, user.password);
    if (!isPasswordMatch)
      throw new ResponseError(400, "Invalid email or password");

    const payload = {
      name: user.name,
      id: user.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    // res.cookie("token", token, {
    //   expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    //   httpOnly: false,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "none",
    // });

    res.status(200).json({
      message: "Login success",
      payload: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified_at: user.email_verified_at,
          phone_number: user.phone_number,
          provider: user.provider,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
