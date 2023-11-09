import ResponseError from "../helper/response_erorr.js";
import { Prisma } from "@prisma/client";

export default (err, req, res, next) => {
  console.error(err);

  let response = {
    error: "Internal Server Error",
    status: 500,
    message: "Something went wrong",
  };

  if (err instanceof ResponseError) {
    response.error = "Client Error";
    response.status = err.status;
    response.message = err.message;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        response.message = `Duplicate field value: ${err.meta.target}`;
      case "P2014":
        response.message = `Invalid ID: ${err.meta.target}`;
      case "P2003":
        response.message = `Invalid input data: ${err.meta.target}`;
    }
    response.error = "PrismaClientKnownRequestError";
    response.status = 400;
  }

  return res.status(response.status).json(response);
};
