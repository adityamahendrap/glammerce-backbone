import ResponseError from "../helper/response_erorr.js";

export default (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
      });

      if (result.error) {
        throw new ResponseError(400, result.error.message);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
