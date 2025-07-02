import express from "express";
import http from "http";
import errorHandlers from "./middleware/error-handlers";
import { applyMiddleware, applyRoutes } from "./middleware/handlers";
import middleware from "./middleware/index";
import * as models from "./models/utils/index.model";
import indexRoute from "./routes/index.route";
import passport from "passport";
import "./utils/passport";
import authRoute from "./routes/auth.route";


const app = express();

app.use(express.static("views"));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(passport.initialize());

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
applyRoutes("/api", indexRoute, app);
applyRoutes("/auth", authRoute, app);
applyMiddleware(errorHandlers, app);

const { PORT = 5000 } = process.env;
const server = http.createServer(app);
server.setTimeout(0);

server.listen(PORT, () =>
    console.log(`Server is running http://localhost:${PORT}...`)
);

models.connect();
