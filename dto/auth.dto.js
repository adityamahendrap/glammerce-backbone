import joi from "joi";

export const registerDto = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  confirm_password: joi.ref("password"),
});

export const loginDto = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});
