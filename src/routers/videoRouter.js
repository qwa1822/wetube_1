import {
  DeleteVideo,
  editVideo,
  getUpload,
  handleWatchVideo,
  postEdit,
  postUpload,
  see,
} from "../controllers/controller";
import express from "express";
import { protectorMiddleware, uploadFiles, videoUpload } from "../middlewares";
const videoRouter = express.Router();

videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(editVideo)
  .post(postEdit);
videoRouter.get("/watch", handleWatchVideo);
videoRouter
  .route("/upload")
  .get(getUpload)
  .post(videoUpload.fields([{ name: "video" }, { name: "thumb" }]), postUpload);
videoRouter.get("/:id([0-9a-f]{24})/", see);
videoRouter.get("/:id([0-9a-f]{24})/delete", protectorMiddleware, DeleteVideo);

export default videoRouter;
