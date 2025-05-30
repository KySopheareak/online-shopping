import express from "express";
import http from "http";
import errorHandlers from "./middleware/error-handlers";
import { applyMiddleware, applyRoutes } from "./middleware/handlers";
import middleware from "./middleware/index";
import * as models from "./models/utils/index.model";
import userRoute from "./routes/user.route";
import productRoute from "./routes/products.route";
import orderRoute from "./routes/orders.route";
import categoryRoute from "./routes/categories.route";
import discountRoute from "./routes/discounts.route";

const app = express();

app.use(express.static("views"));
app.use(express.static("public"));
app.set("view engine", "ejs");

declare global {
  namespace Express {
    interface Request {
      context?: any;
      loginUser?: any;
      decoded?: any;
      // files?: any
      files?:
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | Express.Multer.File[]
        | undefined;
      token?: any;
    }
  }
  interface Error {
    status: string;
  }
}

applyMiddleware(middleware, app);

applyRoutes("/api", productRoute, app);
applyRoutes("/api", userRoute, app);
applyRoutes("/api", orderRoute, app);
applyRoutes("/api", categoryRoute, app);
applyRoutes("/api", discountRoute, app);

applyMiddleware(errorHandlers, app);

const { PORT = 2002 } = process.env;
const server = http.createServer(app);
server.setTimeout(0);

server.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}...`)
);

models.connect();
