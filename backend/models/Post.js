const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "comments.userType",
      required: true,
    },
    userType: { type: String, enum: ["Candidate", "User"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    imageUrl: { type: String },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "authorType",
      required: true,
    },
    authorType: {
      type: String,
      enum: ["Candidate", "User"],
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, refPath: "likesType" }],
    likesType: { type: String, enum: ["Candidate", "User"] },
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
