const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    message: { type: String, maxlength: 500 },
    picture: { type: String },
    video: { type: String },
    likers: { type: [String], required: true },
    comments: {
      type: [
        {
          commentereId: String,
          text: String,
          timestamp: Number,
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);