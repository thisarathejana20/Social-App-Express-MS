const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
  {
    postId: { type: "string", required: true, unique: true },
    userId: { type: "string", required: true, index: true },
    content: { type: "string", required: true },
    createdAt: { type: "date", required: true, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

searchSchema.index({ content: "text" });
searchSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Search", searchSchema);
