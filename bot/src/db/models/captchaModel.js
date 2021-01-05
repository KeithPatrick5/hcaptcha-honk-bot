const mongoose = require("mongoose");

const captchaSchema = mongoose.Schema({
  id: { type: String },
  groupId: { type: String },
  from: { type: Object },
  status: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Captcha", captchaSchema);
