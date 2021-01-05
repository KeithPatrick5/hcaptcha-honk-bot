const mongoose = require("mongoose");
const Captcha = require("../models/captchaModel");

/**
 * Save Captcha object
 * @param {Object} captcha captcha object
 */
exports.saveCaptcha = async (data) => {
  console.log("saveCaptcha:", data);
  data._id = new mongoose.Types.ObjectId();
  const captcha = new Captcha(data);
  await captcha.save();
};

/**
 * Get Captcha object
 * https://mongoosejs.com/docs/api.html#model_Model.updateOne
 * @param {String} id captcha id (not _id)
 */
exports.getCaptcha = async (id) => {
  console.log("getCaptcha:", id);
  try {
    return await Captcha.findOne({ id: id }).exec();
  } catch (error) {
    console.log(error);
  }
};

exports.getAllCaptchasCount = async (status) => {
  console.log("getAllCaptchasCount");
  let condition = {};
  if (status) condition.status = status;
  try {
    return await Captcha.find(condition).countDocuments().exec();
  } catch (error) {
    console.log(error);
  }
};

/**
 * updateValues example `{ $set: {name: "Mickey", address: "Canyon 123" } }`
 * https://mongoosejs.com/docs/api.html#model_Model.updateOne
 * @param {String} id objectId
 * @param {Object} updateValues update attributes
 */
exports.updateCaptcha = async (id, updateValues) => {
  console.log("updateCaptcha id:", id);
  try {
    let res = await Captcha.updateOne({ _id: id }, updateValues).exec();
    return res;
  } catch (error) {
    console.log(error);
  }
};
