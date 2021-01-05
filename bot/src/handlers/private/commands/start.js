const Markup = require("telegraf/markup");
const { getCaptcha, saveCaptcha } = require("../../../db/controllers/captcha");
const { getGroup } = require("../../../db/controllers/group");
const Extra = require("telegraf/extra");
const { nanoid } = require("nanoid");

module.exports = async (ctx) => {
  if (ctx.message.text === "/start") {
    await ctx.reply(
      `Hi ${ctx.from.first_name}!\nThis is captcha bot, add me to supergroups to restrict bots with hCaptcha service (Bot should have admin rights)`
    );
  } else if (ctx.message.text.split(" ")[0] === "/start") {
    // LEGACY CODE
    // captcha in dev mode
    // let id = ctx.message.text.split(" ")[1];
    // const captcha = await getCaptcha(id);
    // await ctx.reply(
    //   `Your captcha id: ${id}\n\nhttp://localhost:3000/captcha/${id}`
    // );
    // await ctx.reply(JSON.stringify(captcha, null, 2));

    let groupId = ctx.message.text.split(" ")[1];
    const group = await getGroup(groupId);
    console.log(groupId, group);

    // Create captcha
    // Save captcha
    const id = nanoid(6);
    const captcha = {
      id: id,
      groupId: groupId,
      from: ctx.from,
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
        : `http://localhost:3000/captcha/${id}`; // DeepLink for dev mode tests
    await ctx.reply(
      `Your captcha:\n\n ${appLink}`,
      Extra.markup((m) => m.inlineKeyboard([[m.urlButton("Captcha", appLink)]]))
    );
  }
};
