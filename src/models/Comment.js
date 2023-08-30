import mongoose from "mongoose";

const commentScheman = new mongoose.Schema({
  createdAt: { type: Date, required: true, default: Date.now },
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "video" },
});

const Comment = mongoose.model("Comment", commentScheman);
export default Comment;
