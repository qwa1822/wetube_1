import express from "express";
import {
  getjoin,
  handleHome,
  join,
  getlogin,
  postjoin,
  search,
  postlogin,
} from "../controllers/userController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", handleHome);
rootRouter.get("/search", search);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getlogin)
  .post(postlogin);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getjoin).post(postjoin);

export default rootRouter;
