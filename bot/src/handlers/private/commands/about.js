module.exports = async (ctx) => {
  let msg = `The bot will block users from messaging in chat until they fill out a captcha.`;
  await ctx.reply(msg);
};