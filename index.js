require("dotenv").config();
const Discord = require("discord.js"); //import discord.js

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
  ],
}); //create new client

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
console.log("Bot is online");
// client.on('messageCreate', msg => {
//     console.log(msg.content);
//   if (msg.content === 'ping') {
//     msg.reply('Pong!');
//   }
// });

client.on("messageCreate", (message) => {
  if (message.author.bot) return false;

  console.log(`Message from ${message.author.username}: ${message.content}`);

  if (message.content === "ping") {
    message.reply("Pong!");
  }
  if (message.content === "!guzzlers") {
    message.reply("I'll send details later!");
  }
});

//make sure this line is the last line
client.login(process.env.CLIENT_APPLICATION_ID);
