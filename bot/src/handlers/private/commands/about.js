module.exports = async (ctx) => {
  let msg = `The bot will block users from messaging in chat until they fill out a captcha.
How it works: Watch this short video - https://youtu.be/GDSLRQaHfic`;
  await ctx.reply(msg);
};