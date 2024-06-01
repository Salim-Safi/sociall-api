const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    picture: {
      type: String,
      default: null,
    },
    role: { type: String, default: "utilisateur" },
    followers: { type: [String] },
    following: { type: [String] },
    likes: { type: [String] },
    bio: { type: String, max: 1024 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
