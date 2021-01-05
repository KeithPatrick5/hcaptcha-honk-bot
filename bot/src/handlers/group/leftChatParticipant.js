const { getGroup, updateGroup } = require("../../db/controllers/group");

module.exports = async (ctx) => {
  if (+ctx.message.left_chat_participant.id === +process.env.BOT_ID) {
    // Bot was kicked from group
    console.log(
      "Bot was kicked from ",
      ctx.chat.type,
      ctx.chat.title,
      ctx.chat.id
    );
    let group = await getGroup(ctx.chat.id);
    console.log(group, group.status);
    let updateValues = { $set: { status: "KICKED" } };
    await updateGroup(group._id, updateValues);
  } else {
    // Someone left group
    console.log(
      ctx.message.left_chat_participant.first_name,
      "left",
      ctx.chat.type,
      ctx.chat.title,
      ctx.chat.id
    );
  }
  return;
};
