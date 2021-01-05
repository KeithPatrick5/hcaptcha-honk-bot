const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
  {
    id: { type: String },
    type: { type: String },
    title: { type: String },
    username: { type: String },
    status: { type: String },
    admins: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
