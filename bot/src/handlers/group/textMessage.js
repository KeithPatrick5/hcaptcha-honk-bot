const Extra = require("telegraf/extra");
const { nanoid } = require("nanoid");
const { saveCaptcha } = require("../../db/controllers/captcha");
const restrictUser = require("../../utils/restrictUser");
const {
  getGroup,
  updateGroup,
  saveGroup,
} = require("../../db/controllers/group");
const { getSession } = require("../../db/controllers/session");

/**
 * Handle text messages in any group / supergroup
 * @param {Object} ctx context
 */
module.exports = async (ctx) => {
  let userId = ctx.message.from.id;

  // If group admins, then leave
  const groupId = ctx.chat.id;
  const text = ctx.message.text;
  let group = await getGroup(groupId);
  if (group.admins) {
    // If user in admins then return
    console.log("Checking user in group admins...");
    for (const admin of group.admins) {
      if (admin.user && admin.user.id === userId) {
        console.log("User is admin");
        // todo: add admin commands
        // /help - list of commands
        // /captcha_each_message - restrict users with Captcha on each message in group
        // /captcha_new_users - restrict only new paticipants with Captcha
        // /clean_mode_on - delete all messages from users
        // /clean_mode_off - do not delete all messages from users
        if (text === "/updateadmins" || text === `/updateadmins@${ctx.me}`) {
          // Update admins for group in database
          await updAdmins(ctx, group);
        } else if (text === "/captcha" || text === `/captcha@${ctx.me}`) {
          // Captcha link
          const link = `https://t.me/${ctx.me}?start=${groupId}`;
          await ctx.reply("Captcha link for this group: " + link);
        } else if (text === "/clean_mode" || text === `/clean_mode@${ctx.me}`) {
          await cleanMode(ctx, group);
        } else if (text === "/help" || text === `/help@${ctx.me}`) {
          let msg = `⚙️ Group admin commands:\n
/updateadmins - 👥 update admins list\n
/captcha - 🔗 🖼 captcha link\n
/captcha_each_message - 🚧 💬 restrict users with Captcha on each message in group\n
/captcha_new_users - 🚧 👤 restrict only new participants with Captcha\n
/clean_mode - 🧹 💬 toggle command Bot delete all new messages from users
`;
          await ctx.reply(msg);
        } else if (
          text === "/captcha_each_message" ||
          text === `/captcha_each_message@${ctx.me}`
        ) {
          await captchaMode(ctx, group, "captcha_each_message");
        } else if (
          text === "/captcha_new_users" ||
          text === `/captcha_new_users@${ctx.me}`
        ) {
          await captchaMode(ctx, group, "captcha_new_users");
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

  if (group.mode === "captcha_each_message") {
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

    // Check if user already exists in Sessions collection
    // If exists, then send captcha message in private with user conversation
    // Note: session key = "userId:userId"
    let session;
    let key = `${userId}:${userId}`;
    try {
      session = await getSession(key);
      console.log("Session key", session.key);
    } catch (error) {
      // User dont start conversation with bot yet
      console.log("User dont start conversation with bot yet.");
    }
    if (session && session.data) {
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
          : `http://127.0.0.1:3000/captcha/${id}`; // DeepLink for dev mode tests

      try {
        await ctx.telegram.sendMessage(
          userId,
          `Your captcha:`,
          Extra.markup((m) =>
            m.inlineKeyboard([[m.urlButton("Captcha", appLink)]])
          )
        );
      } catch (error) {
        console.log(error);
      }
    }

    // If group have clean mode then delete message
    if (group.cleanMode) {
      if (process.env.NODE_ENV === "development")
        console.log("Clean mode active");
      // Delete last user message after 10 sec
      const message_id = ctx.message.message_id;
      await deleteLastMessage(groupId, message_id, ctx);
    }
  }
};

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

/**
 * Toggle clean mode in groups
 * @param {Object} ctx
 * @param {String} groupId
 */
const cleanMode = async (ctx, group) => {
  let msg = "";
  console.log("Group:", group);
  try {
    group.cleanMode = !group.cleanMode;
    console.log("Updated clean mode:", group.cleanMode, !group.cleanMode);
    //await saveGroup(group);
    await updateGroup(group._id, { $set: { cleanMode: group.cleanMode } });
    msg = group.cleanMode ? "Clean mode active" : "Clean mode disabled";
  } catch (error) {
    console.log("Error:", error);
    msg = error;
  }
  await ctx.reply(msg);
};

const captchaMode = async (ctx, group, mode) => {
  let msg = "";
  console.log("Upd captcha mode for group:", group, mode);
  try {
    await updateGroup(group._id, { $set: { mode: mode } });
    msg = "🚧 captcha mode " + mode;
  } catch (error) {
    console.log("Error:", error);
    msg = error;
  }
  await ctx.reply(msg);
};
