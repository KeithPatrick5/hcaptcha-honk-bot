const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema(
  {
    key: { type: String },
    data: { type: Object },
  }
);

module.exports = mongoose.model("Session", sessionSchema);
