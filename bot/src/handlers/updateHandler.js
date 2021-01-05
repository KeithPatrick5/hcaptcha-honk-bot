const privateChat = require("./privateChat");
const groupChat = require("./groupChat");
const channelChat = require("./channelChat");

/**
 * **Filter Updates between different Chat Types**
 *
 * Type of chat, can be either “private”, “group”, “supergroup” or “channel”
 */
module.exports = async (bot) => {
  bot.use(async (ctx, next) => {
    if (ctx.from && ctx.session && !ctx.session.from) {
      ctx.session.from = ctx.from; // Save user info
    }
    const type = ctx.chat.type
    if (type === "private") {
      await privateChat(ctx);
    } else if (type === "group" || type === "supergroup") {
      await groupChat(ctx);
    } else if (type === "channel") {
      await channelChat(ctx);
    } else {
      next();
    }
  });
};
