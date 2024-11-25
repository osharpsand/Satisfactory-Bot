const { Client, GatewayIntentBits } = require('discord.js');
const keep_alive = require('./keep_alive.js');

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,         // To interact with guilds
    GatewayIntentBits.GuildMembers,   // To interact with members
  ],
});

// Bot token (replace with your actual bot token)
const token = 'MTMxMDcxNTUyNTk5MDcxMTMxNg.GH90Fx.jF_rcRZssAn3BykzM52-tj3JcTuDwL1oELSKfw';

// When the bot is logged in
client.once('ready', () => {
  console.log('Bot is online!');
});

// Event that triggers when a new member joins the server
client.on('guildMemberAdd', async (member) => {
  try {
    // Fetch the role by name
    const role = member.guild.roles.cache.find(role => role.name === 'Average Satisfactory Player');
    if (!role) {
      console.log('Role not found!');
      return;
    }

    // Assign the role to the new member
    await member.roles.add(role);
    console.log(`Assigned the 'Average Satisfactory Player' role to ${member.user.tag}`);
  } catch (error) {
    console.error('Error assigning role:', error);
  }
});

// Log in to Discord with your bot token
client.login(token);
