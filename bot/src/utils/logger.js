/* eslint-disable camelcase */

const chalk = require('chalk');
const getMessageType = require('./getMessageType');

const DEFAULT_COLORS = {
  id: chalk.blue,
  chat: chalk.green,
  user: chalk.yellow,
  type: chalk.cyan,
};

const noColor = (str) => str;
const DISABLED_COLORS = {
  id: noColor,
  chat: noColor,
  user: noColor,
  type: noColor,
};

/**Logger based on (just userId added):
 * 
 * https://github.com/pytour/telegraf-update-logger
 * 
 * @param {Object} update Telegram Update
 * @param {Object} options additional options
 */
module.exports.logger = (update, options) => {
  options = options != null ? options : {};

  const msg =
    update.message ||
    update.edited_message ||
    update.channel_post ||
    update.edited_channel_post ||
    update.inline_query ||
    update.callback_query;

  // (from the Telegram API docs):
  // "Message with the callback button that originated the query."
  const originalMessage = msg.message;

  const colors =
    typeof options.colors === 'object'
      ? options.colors
      : options.colors === true
      ? DEFAULT_COLORS
      : DISABLED_COLORS;

  function formatMessageID({ message_id, id }) {
    if (message_id != null) {
      return colors.id(message_id);
    }

    if (id != null) {
      return colors.id(`(inline) ${id}`);
    }

    return null;
  }

  function formatChat({ title }) {
    return title ? colors.chat(title) : null;
  }

  function formatUser({ first_name, last_name, id }) {
    let name = ` ${id} ${first_name}`;
    if (last_name) name += ` ${last_name}`;
    return colors.user(name);
  }

  function formatSender({ from, author_signature }) {
    if (from) return formatUser(from);
    if (author_signature) return colors.user(author_signature);
    return null;
  }

  function formatForward({ forward_from, forward_from_chat }) {
    if (forward_from) return `fwd[${formatUser(forward_from)}]`;
    if (forward_from_chat) return `fwd[${formatChat(forward_from_chat)}]`;
    return null;
  }

  function formatReply({ reply_to_message }) {
    return reply_to_message ? `re[${formatMessageID(reply_to_message)}]` : null;
  }

  function formatEdit({ edit_date }) {
    return edit_date ? '(edited)' : null;
  }

  function formatMessageContent({
    data,
    text,
    sticker,
    contact,
    location,
    new_chat_members,
    left_chat_member,
    new_chat_title,
    new_chat_photo,
    query,
  }) {
    let str = '';

    if (data) {
      str += `${colors.type('action')}: ${data}`;
    } else if (text) {
      str += text;
    } else if (sticker) {
      const { emoji } = sticker;
      str += emoji ? `${emoji}   ${colors.type('sticker')}` : 'sticker';
    } else if (contact) {
      str += `${colors.type('contact')} of ${formatUser(contact)}`;
    } else if (location) {
      const { latitude, longitude } = location;
      str += `${colors.type('location')} on ${latitude} ${longitude}`;
    } else if (new_chat_members) {
      str += `added ${new_chat_members.map(formatUser).join(', ')}`;
    } else if (left_chat_member) {
      str += `removed ${formatUser(left_chat_member)}`;
    } else if (new_chat_title) {
      str += `changed chat title`;
    } else if (new_chat_photo) {
      str += `changed chat photo`;
    } else if (query) {
      str += query;
    } else {
      const msgType = getMessageType(msg);
      str += colors.type(msgType || 'message');
    }

    const { caption } = msg;
    if (caption) str += `, ${caption}`;

    return str;
  }

  let str = `[${formatMessageID(originalMessage || msg)}]`;

  const chat = formatChat((originalMessage || msg).chat || {});
  if (chat) str += ` ${chat}:`;
  const sender = formatSender(msg);
  if (sender) str += ` ${sender}`;
  const forward = formatForward(msg);
  if (forward) str += ` ${forward}`;
  const reply = formatReply(msg);
  if (reply) str += ` ${reply}`;
  const edit = formatEdit(msg);
  if (edit) str += ` ${edit}`;

  str += `: ${formatMessageContent(msg)}`;

  return str;
}
