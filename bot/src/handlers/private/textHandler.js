const Markup = require("telegraf/markup");
const { getAllGroups } = require("../../db/controllers/group");
const { getAllCaptchasCount } = require("../../db/controllers/captcha");
const adminMenu = require("../../keyboards/adminMenu");
const menu = require("../../keyboards/menu");
const isAdmin = require("../../utils/isAdmin");
const { getAllSessionsCount } = require("../../db/controllers/session");

/**
 * Text messages in private chats (simple messages and buttons)
 */
module.exports = async (ctx) => {
  let buttonsText;
  const text = ctx.message.text;

  if (isAdmin(ctx.from.id)) {
    // Check if text belongs to button
    buttonsText = [].concat.apply([], adminMenu);
    if (buttonsText.includes(text)) {
      // Response to buttons
      let msg = text;
      if (text === "Groups") {
        let groups = await getAllGroups();
        msg += "\nTotal groups: " + groups.length + "\n";
        let i = 0;
        for (const group of groups) {
          if (i > 30) break;
          i++;
          msg += `\n${i}) ` + group.title;
          if (group.username) msg += ` @` + group.username;
        }
      } else if (text === "Stats") {
        let groups = await getAllGroups();
        let captchasCount = await getAllCaptchasCount();
        let captchasSolvedCount = await getAllCaptchasCount("SOLVED");
        let totalSessions = await getAllSessionsCount();
        msg += "\n\nTotal groups: " + groups.length + "\n";
        msg += "\nTotal captchas: " + captchasCount + "\n";
        msg += "\nCaptchas solved: " + captchasSolvedCount + "\n";
        msg += "\nTotal users: " + totalSessions + "\n";
      }
      return ctx.replyWithHTML(
        msg,
        Markup.keyboard(adminMenu).resize().extra()
      );
    }
    // By default return admin menu
    return ctx.replyWithHTML(
      "Menu:",
      Markup.keyboard(adminMenu).resize().extra()
    );
  }

  return ctx.replyWithHTML("Menu:", Markup.keyboard(menu).resize().extra());
};
