const actionsHandler = require("./private/actionsHandler");
const commandHandler = require("./private/commandHandler");
const textHandler = require("./private/textHandler");

/**
 * For private chats
 */
module.exports = async (ctx) => {
  if (ctx.message) {
    // Get commands
    if (ctx.message.text.startsWith("/")) {
      // Commands
      return await commandHandler(ctx);
    }
    // Text Handler in Private Chat with User
    return await textHandler(ctx);
  } else if (ctx.update.callback_query) {
    // Button callback
    await actionsHandler(ctx);
  }
};