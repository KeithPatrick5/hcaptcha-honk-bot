const { notification } = require('../../utils/notification');

export default async (req, res) => {
  const {
    body: { chatId, userId, message },
    method,
  } = req;

  // Nend notification message in group chat with RabbitMQ
  // Message should be related to user (by first_name)
  try {
    console.log('Send notification message:', message);
    notification(chatId, userId, message)
    res.statusCode = 200;
    res.json({ success: true, result: "Ok" });
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.json({ success: false, result: error.message });
  }
};
