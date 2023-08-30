import mongoose from "mongoose";

// export const formatHashtags = hashtags =>
//   hashtags
//     .split(",")
//     .map(word =>
//       word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`
//     );

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true },
  thumbUrl: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  fileUrl: { type: String, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
videoSchema.static("changePathFormula", urlPath => {
  return urlPath.replace(/\\/g, "/");
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map(word => (word.startsWith("#") ? word : `#${word}`));
});

// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map(word =>
//       word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`
//     );
// });
const Video = mongoose.model("video", videoSchema);

export default Video;

///////
