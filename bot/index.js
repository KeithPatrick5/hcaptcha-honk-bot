const { TelegrafMongoSession } = require("telegraf-session-mongodb");
const { MongoClient } = require("mongodb");
const { logger } = require("./src/utils/logger");
const Telegraf = require("telegraf");
const updateHandler = require("./src/handlers/updateHandler");
const mongoose = require("mongoose");
const bot = new Telegraf(process.env.BOT_TOKEN);
const { notification } = require("./src/utils/notification");

let session;
// Middlewares
//if (process.env.NODE_ENV === "development") bot.catch((e) => console.log(e));
bot.catch((e) => console.log(e));

bot.use((...args) => session.middleware(...args));
bot.use((ctx, next) => {
  //console.log(JSON.stringify(ctx.update, null, 2));
  console.log(logger(ctx.update, { colors: true }));
  next();
});

// MongoDB
MongoClient.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async (client) => {
  const db = client.db();
  session = new TelegrafMongoSession(db, {
    collectionName: "sessions",
    sessionName: "session",
  });
  bot.launch();
  let info = await bot.telegram.getMe();
  console.log("Bot started", info);
  await updateHandler(bot);
  
  try {
    notification(bot);
  } catch (error) {
    console.log('Notification error:', error);
  }
});

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (error) {
    console.log(
      "open done" + mongoose.connection.host + "\t" + mongoose.connection.port
    );
    if (error) {
      console.log("error" + error);
    } else {
    }
  }
);
