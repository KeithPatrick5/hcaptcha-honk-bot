const mongoose = require("mongoose");
const Group = require("../models/groupModel");

exports.saveGroup = async (data) => {
    console.log("saveGroup:", data);
    data._id = new mongoose.Types.ObjectId();
    const group = new Group(data);
    await group.save();
};

exports.getGroup = async (id) => {
    console.log("getGroup:", id);
    try {
        group = await Group.findOne({ id: id }).exec();
        return group;
    } catch (error) {
        console.log(error);
        throw error
    }
};

exports.getAllGroups = async () => {
    console.log("getAllGroups");
    try {
        group = await Group.find({}).exec();
        return group;
    } catch (error) {
        console.log(error);
    }
};

exports.updateGroup = async (id, updateValues) => {
    // var updateValues = { $set: {name: "Mickey", address: "Canyon 123" } };
    // https://mongoosejs.com/docs/api.html#model_Model.updateOne
    console.log("updateGroup id:", id);
    try {
        let res = await Group.updateOne(
            { _id: id },
            updateValues
        ).exec();
        return res;
    } catch (error) {
        console.log(error);
    }
};
