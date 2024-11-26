console.log('Starting');

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
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
    GatewayIntentBits.GuildMessages,  // To send messages in channels
  ],
});

// Function to create and register slash commands
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('updateplaytime')  // Changed to lowercase
      .setDescription('Update a member\'s role based on their playtime')
      .addUserOption(option => 
        option.setName('member')
          .setDescription('The member to update')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('playtime')
          .setDescription('The playtime of the member in hours')
          .setRequired(true)),
]
.map(command => command.toJSON());

  await client.application.commands.set(commands);
}

// Function to assign a role based on playtime
async function assignRoleBasedOnPlaytime(member, playtime) {
  try {
    const roleName = getRoleByPlaytime(playtime);
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

    // Assign the role to the member
    await member.roles.add(role);
    console.log(`Assigned the '${roleName}' role to ${member.user.tag}`);
  } catch (error) {
    console.error(`Error assigning role to ${member.user.tag}:`, error);
  }
}

// Helper function to get role name based on playtime
function getRoleByPlaytime(playtime) {
  const playtimeThresholds = [
    { hours: 10, role: 'Novice Player' },
    { hours: 50, role: 'Intermediate Player' },
    { hours: Infinity, role: 'Experienced Player' },
  ];

  for (const threshold of playtimeThresholds) {
    if (playtime < threshold.hours) {
      return threshold.role;
    }
  }
  return null;
}
// Function to assign default role and send a welcome message
async function assignDefaultRole(member) {
  try {
    const roleName = 'New Member'; // Adjust role name as needed
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

    // Send a welcome message in the "general" channel
    await sendWelcomeMessage(member);
  } catch (error) {
    console.error(`Error assigning default role or sending welcome message to ${member.user.tag}:`, error);
  }
}

// Function to send a welcome message to the general channel
async function sendWelcomeMessage(member) {
  try {
    const generalChannel = member.guild.channels.cache.find(channel => channel.name === 'general');
    
    if (generalChannel) {
      await generalChannel.send(`Welcome to the server, ${member.user.tag}! We're happy to have you here!`);
    } else {
      console.error('No "general" channel found.');
    }
  } catch (error) {
    console.error(`Error sending welcome message: ${error}`);
  }
}

// Event that triggers when a new member joins the server
client.on('guildMemberAdd', async (member) => {
  console.log(`New member joined: ${member.user.tag}`);
  
  // Assign the default "New Member" role
  await assignDefaultRole(member);
});

// Handle Slash Command Interaction
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'updateplaytime') {
    const guildOwner = interaction.guild.ownerId;
    if (interaction.user.id !== guildOwner) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const member = interaction.options.getUser('member');
    const playtime = interaction.options.getInteger('playtime');

    if (member && playtime !== null) {
      // Fetch the member from the guild
      const guildMember = await interaction.guild.members.fetch(member.id);

      // Call the function to assign the role based on playtime
      await assignRoleBasedOnPlaytime(guildMember, playtime);

      // Acknowledge the interaction
      await interaction.reply({
        content: `Updated the role for ${guildMember.user.tag} based on their ${playtime} hours of playtime.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'Invalid member or playtime provided.', ephemeral: true });
    }
  }
});

// Initialize bot
client.once('ready', async () => {
  console.log('Bot is online!');
  
  // Register the commands
  await registerCommands();
});

// Log in to Discord with your bot token
client.login(token);
