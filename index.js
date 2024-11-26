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

// When the bot is logged in
client.once('ready', async () => {
  console.log('Bot is online!');

  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('UpdatePlaytime')
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
});

// Function to assign a role based on playtime
async function assignRoleBasedOnPlaytime(member, playtime) {
  try {
    // Define roles based on playtime
    let roleName;
    if (playtime < 10) {
      roleName = 'Novice Player'; // Less than 10 hours
    } else if (playtime < 50) {
      roleName = 'Intermediate Player'; // Between 10 and 50 hours
    } else {
      roleName = 'Experienced Player'; // 50+ hours
    }

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

    // Assign the role to the member
    await member.roles.add(role);
    console.log(`Assigned the '${roleName}' role to ${member.user.tag}`);
  } catch (error) {
    console.error(`Error assigning role to ${member.user.tag}:`, error);
  }
}

// Function to assign a default role when a member joins
async function assignDefaultRole(member) {
  try {
    const roleName = 'New Member';  // Adjust role name as needed
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
    const generalChannel = member.guild.channels.cache.find(channel => channel.name === 'general');
    if (generalChannel) {
      generalChannel.send(`Welcome to the server, ${member.user.tag}! We're happy to have you here!`);
    } else {
      console.error('No "general" channel found.');
    }
  } catch (error) {
    console.error(`Error assigning default role or sending welcome message to ${member.user.tag}:`, error);
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

  if (commandName === 'UpdatePlaytime') {
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
        ephemeral: true, // Only the user who invoked the command will see this
      });
    } else {
      await interaction.reply({ content: 'Invalid member or playtime provided.', ephemeral: true });
    }
  }
});

// Log in to Discord with your bot token
client.login(token);

