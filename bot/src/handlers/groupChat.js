const newChatParticipant = require("./group/newChatParticipant");
const leftChatParticipant = require("./group/leftChatParticipant");
const textMessage = require("./group/textMessage");

/**
 * Group chats handler
 */
module.exports = async (ctx) => {
  if (process.env.NODE_ENV === "development")
    console.log(JSON.stringify(ctx.update, null, 2));

  // Only messages
  if (!ctx.message) return;

  // Save meesage date
  ctx.session.lastMsgDate = new Date().toJSON();

  // If chat admin skip restrictions

  if (ctx.message.new_chat_participant) {
    await newChatParticipant(ctx);
  } else if (ctx.message.left_chat_participant) {
    await leftChatParticipant(ctx);
  } else if (ctx.message.text) {
    await textMessage(ctx);
  }
};
