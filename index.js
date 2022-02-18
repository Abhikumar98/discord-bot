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
    message.reply("Hold tight, loading your bag 👀");
    const { totalWorth, profitLoss, avatar } = await fetchNFTs(checkForAddress[1]);

    const link = `https://worthinnft.com/${checkForAddress[1]}`;
     const components = [
			{
				type: 1,
				components: [
					{
						style: 5,
						label: `Checkout complete portfolio`,
						url: link,
						disabled: false,
						emoji: {
							id: null,
							name: `🔗`,
						},
						type: 2,
					},
				],
			},
		];
    let embed = new Discord.MessageEmbed();
    embed.setTitle("WorthInNFt");
    embed.setDescription("Summary of your (N)FA so far");
    embed.setAuthor(
		checkForAddress[1],
		avatar,
		link
    );
    embed.setThumbnail(avatar ?? `https://www.worthinnft.com/favicon.png`);
    embed.setColor(Number(profitLoss) < 0 ? "#ef4444" : "#059669");
    embed.setURL(link);
		embed.addFields([
			{
				name: `Total Worth`,
				value: `${totalWorth.toFixed(4)} ETH`,
				inline: true,
			},
			{
				name: "\u200B",
				inline: true,
				value: "\u200B",
			},
			{ name: `Profit / Loss`, value: `${profitLoss}%`, inline: true },
		]);
    embed.setFooter(`By WorthInNFt`, `https://www.worthinnft.com/favicon.png`);
    message.channel.send({ embeds: [embed], components: components });
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
  if (message.content === "!test") {
    
    const components = [
		{
			type: 1,
			components: [
				{
					style: 5,
					label: `Checkout complete portfolio`,
					url: `https://www.worthinnft.com/favicon`,
					disabled: false,
					emoji: {
						id: null,
						name: `🔗`,
					},
					type: 2,
				},
			],
		},
	];

     let embed = new Discord.MessageEmbed();
      embed.setTitle("WorthInNFt");
      embed.setDescription("Summary of your (N)FA so far");
      embed.setAuthor(
			"abhishekkumar.eth",
			"",
			`https://worthinnft.com/abhishekkumar.eth`
		);
      embed.setThumbnail(
			`https://vibeheads.mypinata.cloud/ipfs/QmbiQo7ZwGSPqRUrsWr1kxBKMLfWWBdv5euFJL3ibqETkL/101.gif`
		);
      embed.setColor(Number(10) < 0 ? "#ef4444" : "#059669");
    embed.setURL(`https://worthinnft.com/abhishekkumar.eth`);
    embed.addFields([
		{
			name: `Total Worth`,
			inline: true,
			value: `${(1234).toFixed(4)} ETH`,
		},
		{
			name: "\u200B",
			inline: true,
			value: "\u200B",
		},
		{ name: `Profit / Loss`, inline: true, value: `${123}%` },
	]);
      message.channel.send({ embeds: [embed], components });
    }
});

//make sure this line is the last line
client.login(process.env.CLIENT_APPLICATION_ID);
