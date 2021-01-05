const about = require("./commands/about");
const start = require("./commands/start");
const isAdmin = require("../../utils/isAdmin");
/**
 * Commands in private chats
 */
module.exports = async (ctx) => {
  if (ctx.message.text === "/about") {
    return about(ctx);
  } else if (ctx.message.text.startsWith("/start")) {
    return start(ctx);
  }
};
