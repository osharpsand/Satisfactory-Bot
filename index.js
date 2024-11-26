console.log('Starting');

const { Client, GatewayIntentBits } = require('discord.js');
require('./keep_alive.js');

// Ensure the bot token is available
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Bot token is missing! Please set BOT_TOKEN in your environment.');
  process.exit(1); // Exit the process if no token is found
}

// Create a new Discord client with relevant intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,         // To interact with guilds
    GatewayIntentBits.GuildMembers,   // To interact with members
  ],
});

// When the bot is logged in
client.once('ready', () => {
  console.log('Bot is online!');
});

// Function to assign a specified role to a new member
async function assignRoleToMember(member, roleName) {
  try {
    // Fetch the role by name
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (!role) {
      console.error(`Role '${roleName}' not found in the guild: ${member.guild.name}`);
      return;
    }

    // Check if the member already has the role
    if (member.roles.cache.has(role.id)) {
      console.log(`${member.user.tag} already has the '${roleName}' role.`);
      return;
    }

    // Assign the role to the new member
    await member.roles.add(role);
    console.log(`Assigned the '${roleName}' role to ${member.user.tag}`);
  } catch (error) {
    console.error(`Error assigning role to ${member.user.tag}:`, error);
  }
}

// Event that triggers when a new member joins the server
client.on('guildMemberAdd', async (member) => {
  console.log(`New member joined: ${member.user.tag}`);
  const roleName = 'Average Satisfactory Player'; // You can change this role name if needed
  await assignRoleToMember(member, roleName); // Call the separate function to assign the role
});

// Optional: Track when a member leaves
client.on('guildMemberRemove', (member) => {
  console.log(`${member.user.tag} has left the server.`);
});

// Log in to Discord with your bot token
client.login(token);
