dotenv.config();
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import error from "./middleware/error.js";
import winston from "winston";
import authHandler from "./handler/auth.handler.js";
import productHandler from "./handler/product.handler.js";

const { combine, timestamp, printf, colorize, align } = winston.format;

const app = express();
const port = process.env.PORT || 8080;
const domain = process.env.DOMAIN || "http://localhost:" + port;

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  domain,
  process.env.FRONTEND_ORIGIN + "/sign-in",
];

const corsOptions = {
  // origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*",
  origin: allowedOrigins,
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, // when credentials are true, origin cannot be set to "*"
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  next();
});
app.use("/api/auth", authHandler);
app.use("/api/products", productHandler);
app.use(error);

app.listen(port, () => {
  console.log("Server running on", domain);
});
