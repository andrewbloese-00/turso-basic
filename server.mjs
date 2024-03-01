import express from "express";
import { config as configEnv } from "dotenv";
// import { useSession } from "./middleware/useSession.js";
//routers
import { productsRouter } from "./routes/products.mjs";
import { authRouter } from "./routes/auth.mjs";
//db config
import { ProductInitializer } from "./models/Product.mjs";
import { UserInitializer } from "./models/User.mjs";
import { requestLogger } from "./middleware/requestLogger.js";
import { ProductVariantInitializer } from "./models/ProductVariant.mjs";
import { ProductVariantTypesInitializer } from "./models/ProductVariantType.mjs";

configEnv();
async function initServer(port) {
  //ensure db is ready to be connected to, set up tables and indexes, etc
  await ProductInitializer();
  await ProductVariantTypesInitializer();
  await ProductVariantInitializer();
  await UserInitializer();

  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  // app.use(useSession);

  app.get("/ping", (req, res) => {
    res.status(200).send("PONG");
  });
  app.use("/api/products", productsRouter);
  app.use("/api/auth", authRouter);
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

initServer(process.env.PORT || 8080);
