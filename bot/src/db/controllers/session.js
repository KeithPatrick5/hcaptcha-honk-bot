const mongoose = require("mongoose");
const Session = require("../models/sessionModel");

exports.getAllSessionsCount = async () => {
  console.log("getAllSessionsCount");
  try {
    return await Session.find({}).countDocuments().exec();
  } catch (error) {
    console.log(error);
  }
};

exports.getSession = async (key) => {
  console.log("getSession", key);
  try {
    return await Session.findOne({ key: key }).exec();
  } catch (error) {
    console.log(error);
  }
};
