import express from "express";
import logger from "morgan";
import session from "express-session";
import { handleEdit, handleHome, search } from "./controllers/controller";
import videoRouter from "./routers/videoRouter";
import globalRouter from "./routers/rootRouter";
import rootRouter from "./routers/rootRouter";
import { localsMiddleware } from "./middlewares";
import MongoStore from "connect-mongo";
import { connection } from "mongoose";
import {
  finalGithubLogin,
  logout,
  startGithubLogin,
} from "./controllers/userController";
import user from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import flash from "express-flash";

const app = express();

const loggerMiddleware = logger("dev");

const PORT = 4000;

app.use(flash());
app.use(loggerMiddleware);
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use((req, res, next) => {
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});

app.get("/add-one", (req, res, next) => {
  req.session.potato += 1;

  return res.send(`${req.session.id}\n ${req.session.potato}`);
});

app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));

app.use("/uesrs", user);

app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
