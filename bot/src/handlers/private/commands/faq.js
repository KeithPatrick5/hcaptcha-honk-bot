module.exports = async (ctx) => {
  let msg = `FAQ`;
  msg += `\n\nHow it works? Watch this short video - https://youtu.be/GDSLRQaHfic`;
  await ctx.reply(msg);
};
