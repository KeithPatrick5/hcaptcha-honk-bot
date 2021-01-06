const Extra = require("telegraf/extra");
const { nanoid } = require("nanoid");
const { saveCaptcha } = require("../../db/controllers/captcha");
const restrictUser = require("../../utils/restrictUser");
const { getGroup, updateGroup } = require("../../db/controllers/group");
const { getSession } = require("../../db/controllers/session");

const updAdmins = async (ctx, group) => {
  // Update admins for group in database
  try {
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    await new Promise((r) => setTimeout(r, 2000));
    let updateValues = { $set: { admins: admins } };
    await updateGroup(group._id, updateValues);
    await ctx.reply("Ok, i remember admins of this group 🧠 🤓");
  } catch (error) {
    console.log(error);
    await ctx.reply("🥺 Error" + error);
  }
};

/**
 * Handle text messages in any group / supergroup
 * @param {Object} ctx context
 */
module.exports = async (ctx) => {
  let userId = ctx.message.from.id;

  // If group admins, then leave
  const groupId = ctx.chat.id;
  let group = await getGroup(groupId);
  if (group.admins) {
    // If user in admins then return
    console.log("Checking user in group admins...");
    for (const admin of group.admins) {
      if (admin.user && admin.user.id === userId) {
        console.log("User is admin");

        if (ctx.message.text === "/updateadmins") {
          // Update admins for group in database
          await updAdmins(ctx, group);
        } else if (ctx.message.text === "/captcha") {
          // Captcha link
          const link = `https://t.me/${ctx.me}?start=${groupId}`;
          await ctx.reply("Captcha link for this group: " + link);
        }
        return;
      }
    }
  }
  // If message from non-admin Bot.
  // We dont set restrictions but delete message after 10 sec
  if (ctx.message.from.is_bot) {
    const message_id = ctx.message.message_id;
    return await deleteLastMessage(groupId, message_id, ctx);
  }

  // Set restrictions for each message from regular user in group
  try {
    await restrictUser(ctx, userId);
  } catch (error) {
    if (
      error.message ===
      "400: Bad Request: not enough rights to restrict/unrestrict chat member"
    ) {
      return await ctx.reply(
        "Bot doesn't have enough rights to restrict/unrestrict chat member.\nPlease add me to the admins."
      );
    } else if (
      error.message ===
      "400: Bad Request: method is available only for supergroups"
    ) {
      return await ctx.reply(
        "Bot is available only for supergroups.\nPlease upgrade this group to supergroup."
      );
    }
    console.log("Resrict error:", error.message);
  }

  // Legacy code
  {
    /*
  let timeout = process.env.TIMEOUT
  let msg = `${ctx.message.from.first_name} you are restricted at this group ${timeout == 0 ? '' : `for ${timeout} minutes`}`;
  msg += "\nTo skip restrictions solve captcha:";

  const id = nanoid(6);
  const captcha = {
    id: id,
    groupId: ctx.chat.id,
    from: ctx.message.from,
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
      : `https://t.me/${ctx.me}?start=${id}`; // DeepLink for dev mode tests
  console.log("Captcha url", appLink);
  await ctx.reply(
    msg,
    Extra.markup((m) => m.inlineKeyboard([[m.urlButton("Captcha", appLink)]]))
  );
  */
  }

  // Check if user already exists in Sessions collection
  // If exists, then send captcha message in private with user conversation
  // Note: session key = "userId:userId"

  let session;
  let key = `${userId}:${userId}`;
  try {
    session = await getSession(key);
    console.log("session", session);
  } catch (error) {
    // User dont start conversation with bot yet
    console.log("User dont start conversation with bot yet.");
  }
  if (session) {
    // Create captcha and send in pm
    const id = nanoid(6);
    const captcha = {
      id: id,
      groupId: groupId,
      from: ctx.message.from,
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
    await ctx.telegram.sendMessage(
      userId,
      `Your captcha:\n\n ${appLink}`,
      Extra.markup((m) => m.inlineKeyboard([[m.urlButton("Captcha", appLink)]]))
    );
  }

  // TODO: delete last user message after 10 sec
  const message_id = ctx.message.message_id;
  await deleteLastMessage(groupId, message_id, ctx);
};

/**
 * Delete Message after 10 sec
 * - If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.
 * @param {String} chatId
 * @param {String} message_id
 * @param {Object} ctx context
 */
const deleteLastMessage = async (chatId, message_id, ctx) => {
  try {
    await new Promise((resolve) =>
      setTimeout(deleteMsg, 10000, chatId, message_id, ctx)
    );
  } catch (error) {
    ctx.reply(error);
  }
};

const deleteMsg = async (chatId, message_id, ctx) => {
  try {
    await ctx.telegram.deleteMessage(chatId, message_id);
  } catch (error) {
    console.log(error);
    throw error.message;
  }
};
