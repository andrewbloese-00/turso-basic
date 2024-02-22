import express from "express";
import { config as configEnv } from "dotenv";
import { useSession } from "./middleware/useSession";
//routers
import { productsRouter } from "./routes/products.mjs";
import { authRouter } from "./routes/auth.mjs";
//db config
import { ProductInitializer } from "./models/Product.mjs";
import { UserInitializer } from "./models/User.mjs";

configEnv();
async function initServer(port) {
  //ensure db is ready to be connected to, set up tables and indexes, etc
  await ProductInitializer();
  await UserInitializer();

  const app = express();
  app.use(express.json());
  app.use(useSession);

  app.use("/api/products", productsRouter);
  app.use("/api/auth", authRouter);
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

initServer(process.env.PORT || 8080);
