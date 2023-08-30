import express from "express";
import {
  RegesiterView,
  createComment,
  deleteComment,
} from "../controllers/controller";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", RegesiterView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/videos/:id([0-9a-f]{24})/comment/delete", deleteComment);
export default apiRouter;
