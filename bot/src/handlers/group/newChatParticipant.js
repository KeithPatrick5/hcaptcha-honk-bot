const {
  saveGroup,
  getGroup,
  updateGroup,
} = require("../../db/controllers/group");
const restrictUser = require("../../utils/restrictUser");
const { saveCaptcha } = require("../../db/controllers/captcha");
const Extra = require("telegraf/extra");
const { nanoid } = require("nanoid");

module.exports = async (ctx) => {
  // If new_chat_participant update then
  // need to check if this participant is our bot
  if (+ctx.message.new_chat_participant.id === +process.env.BOT_ID) {
    // Bot was added to some group
    console.log(
      "Bot was added to ",
      ctx.chat.type,
      ctx.chat.id,
      ctx.chat.title
    );
    try {
      let group = await getGroup(ctx.chat.id);
      if (group.status === "KICKED") {
        // Update status to 'Active'
        let updateValues = { $set: { status: "ACTIVE" } };
        await updateGroup(group._id, updateValues);
      }
    } catch (err) {
      console.log(err);
      // New group
      try {
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
        await saveGroup({
          id: ctx.chat.id,
          type: ctx.chat.type,
          title: ctx.chat.title,
          username: ctx.chat.username || null,
          status: "ACTIVE",
          admins: admins,
        });
      } catch (error) {
        console.log(error);
      }
    }

    ctx.reply("Bot successfuly added to " + ctx.chat.title);

    const link = `https://t.me/${ctx.me}?start=${ctx.chat.id}`;
    ctx.reply("Click on this link to remove restrictions with bot " + link);
  } else {
    // Someone added to group
    console.log(
      ctx.message.new_chat_participant,
      "added to",
      ctx.chat.type,
      ctx.chat.id,
      ctx.chat.title
    );
    // do we need to define if user was added by another user ?
    let userId = ctx.message.new_chat_participant.id;
    let first_name = ctx.message.new_chat_participant.first_name;
    await restrictUser(ctx, userId);

    // Legacy code
    {
      /*
      let msg = first_name + " welcome to " + ctx.chat.title;
      msg += "\nTo skip restrictions solve captcha:";

      const id = nanoid(6);
      const captcha = {
        id: id,
        groupId: ctx.chat.id,
        from: ctx.message.new_chat_participant,
        status: "ACTIVE",
      };
      try {
        await saveCaptcha(captcha);
        console.log("Captcha saved id", id);
      } catch (error) {
        console.log(error);
      }

      const appLink =
        process.env.NODE_ENV === "production"
          ? `${process.env.WEBAPP_URI}/captcha/${id}`
          : `https://t.me/${ctx.me}?start=${id}`; // DeepLink for dev mode tests

      console.log("Captcha url", appLink);
      await ctx.reply(
        msg,
        Extra.markup((m) =>
          m.inlineKeyboard([[m.urlButton("Captcha", appLink)]])
        )
      );
      */
    }
  }
};
