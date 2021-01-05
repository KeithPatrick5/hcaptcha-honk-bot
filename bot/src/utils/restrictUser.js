module.exports = async (ctx, userId) => {
  //
  // Set restrictions for each message from user in group
  let timeout = process.env.TIMEOUT; // Min
  let until_date = Math.floor(
    new Date(new Date().getTime() + timeout * 60000).getTime() / 1000
  ); // Seconds
  let chatId = ctx.chat.id;
  let options = {
    can_send_messages: false,
    until_date: until_date,
  };
  await ctx.telegram.restrictChatMember(chatId, userId, options);
};
