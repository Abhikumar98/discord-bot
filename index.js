require("dotenv").config();
const Discord = require("discord.js"); //import discord.js
const { scrape } = require("./browser");
const { fetchNFTs } = require("./nft");

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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;

  console.log(`Message from ${message.author.username}: ${message.content}`);

  if (message.content === "ping") {
    message.reply("Pong!");
  }

  const checkNFTCommand = message.content.startsWith("!nft");

  const checkForAddress = message.content.split(" ");
  console.log({ checkForAddress, checkNFTCommand });

  if (checkNFTCommand && checkForAddress.length === 2) {
    message.reply("Hold up sending collections of nfts...");
    const { totalWorth, profitLoss } = await fetchNFTs(checkForAddress[1]);
    let embed = new Discord.MessageEmbed();
    embed.setTitle("WorthInNFt");
    embed.setDescription("Your NFT portfolio");
    embed.setColor(!Number(profitLoss) ? "#ef4444" : "#059669");
    embed.setURL(`https://worthinnft.com/${checkForAddress[1]}`);
		embed.addField(
			`Total Worth`,
			`${totalWorth.toFixed(4)} ETH`,
		)
		embed.addField(`Profit / Loss`, `${profitLoss}%`);
    message.channel.send({ embeds: [embed] });
    // message.channel.send({ embeds: [embed] });
  }

  if (message.content === "!g") {
    message.channel.send("Hold up fetching data...");
    const response = await scrape();
    let embed = new Discord.MessageEmbed();
    embed.setTitle("Gas Guzzlers ⛽️");
    embed.setDescription("Top 10 Gas guzzlers");
    response.forEach((msg, index) =>
      embed.addField(
        `${index + 1}. ${msg.name}`,
        `[Checkout on etherscan](${msg.link})`
      )
      );
      message.channel.send({ embeds: [embed] });
    }
    if (message.content === "!gas") {
      message.channel.send("Hold up fetching data...");
      let embed = new Discord.MessageEmbed();
      embed.setTitle("Gas Guzzlers ⛽️");
      embed.setAuthor("#059669");
      embed.setDescription("Top 10 Gas guzzlers");
      embed.addField(
        `some `,
        `asdf`
      )
      message.channel.send({ embeds: [embed] });
  }
});

//make sure this line is the last line
client.login(process.env.CLIENT_APPLICATION_ID);
