import express from "express";
import {
  EditPost,
  getChangePassword,
  getEdit,
  handleEdit,
  postChangePassword,
  postEdit,
  see,
} from "../controllers/controller";
import {
  See,
  finalGithubLogin,
  kakaoStart,
  kakaofinish,
  logout,
  startGithubLogin,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const user = express.Router();

user
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), EditPost);
user.get("/logout", protectorMiddleware, logout);
user.get("/github/start", publicOnlyMiddleware, startGithubLogin);

user
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
user.get("/github/finish", publicOnlyMiddleware, finalGithubLogin);
user.get("/kakaostart", kakaoStart);
user.get("/kakaofinish", kakaofinish);
user.get("/:id", See);

export default user;
