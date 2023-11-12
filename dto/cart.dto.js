import joi from "joi";

export const addToCartDto = joi.object({
  product_id: joi.string().required(),
  quantity: joi.number().required(),
  key: joi.string().required(),
});
