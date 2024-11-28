console.log('Starting');

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('./keep_alive.js');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Bot token is missing! Please set BOT_TOKEN in your environment.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildIntegrations,
  ],
});

/**
 * Clear all existing commands (global and specific guild)
 */
async function clearCommands() {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Fetching and clearing global application commands...');
    const globalCommands = await rest.get(Routes.applicationCommands(client.user.id));
    if (globalCommands.length > 0) {
      console.log(`Clearing ${globalCommands.length} global commands...`);
      await Promise.all(globalCommands.map(cmd => rest.delete(Routes.applicationCommand(client.user.id, cmd.id))));
      console.log('Global commands cleared.');
    }

    // Clear guild-specific commands if GUILD_ID is provided
    const guildId = process.env.GUILD_ID;
    if (guildId) {
      console.log(`Fetching and clearing commands for guild ${guildId}...`);
      const guildCommands = await rest.get(Routes.applicationGuildCommands(client.user.id, guildId));
      if (guildCommands.length > 0) {
        console.log(`Clearing ${guildCommands.length} guild-specific commands...`);
        await Promise.all(guildCommands.map(cmd => rest.delete(Routes.applicationGuildCommand(client.user.id, guildId, cmd.id))));
        console.log('Guild-specific commands cleared.');
      }
    }
  } catch (error) {
    console.error('Error clearing commands:', error);
  }
}

/**
 * Register global application commands
 */
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('updateplaytime')
      .setDescription('Update a member\'s role based on their playtime')
      .addUserOption(option => 
        option.setName('member')
          .setDescription('The member to update')
          .setRequired(true))
      .addIntegerOption(option => 
        option.setName('playtime')
          .setDescription('The playtime of the member in hours')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('calculatemachinesneeded')
      .setDescription('Calculate machines needed for item production')
      .addStringOption(option =>
        option.setName('machine_name')
          .setDescription('Name of the machine')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('item_name')
          .setDescription('Name of the item')
          .setRequired(true))
      .addNumberOption(option => 
        option.setName('items_needed')
          .setDescription('Items to produce per minute')
          .setRequired(true))
      .addNumberOption(option => 
        option.setName('machine_process_speed')
          .setDescription('Items one machine produces per minute')
          .setRequired(true)),
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Registering global application commands...');
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Global commands registered.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

/**
 * Assign role based on playtime
 */
async function assignRoleBasedOnPlaytime(member, playtime) {
  try {
    const roleName = getRoleByPlaytime(playtime);
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (!role) return;

    if (!member.roles.cache.has(role.id)) {
      await member.roles.add(role);
      console.log(`Assigned the '${roleName}' role to ${member.user.tag}`);
    }
  } catch (error) {
    console.error(`Error assigning role:`, error);
  }
}

function getRoleByPlaytime(playtime) {
  const thresholds = [
    { hours: 24, role: 'Satisfactory Liker' },
    { hours: 50, role: 'Satisfactory Enjoyer' },
    { hours: 100, role: 'Satisfactory Lover' },
    { hours: 250, role: 'Serious Satisfactory Player' },
    { hours: 500, role: 'Satisfactory Addict' },
    { hours: 1000, role: 'Satisfactory Completionist' },
  ];
  return thresholds.find(t => playtime >= t.hours)?.role || null;
}

/**
 * Event listeners
 */
client.on('guildMemberAdd', async (member) => {
  const roleName = 'Satisfactory Player';
  const role = member.guild.roles.cache.find(role => role.name === roleName);
  if (role && !member.roles.cache.has(role.id)) {
    await member.roles.add(role);
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (welcomeChannel) {
      await welcomeChannel.send(`Welcome to the server, ${member.user.tag}!`);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Update Playtime Command
  if (commandName === 'updateplaytime') {
    try {
      const member = interaction.options.getUser('member');
      const playtime = interaction.options.getInteger('playtime');

      if (!member || playtime === null) {
        return interaction.reply({ content: 'Invalid member or playtime provided.', ephemeral: true });
      }

      const guildMember = await interaction.guild.members.fetch(member.id);
      const roleName = getRoleByPlaytime(playtime);

      if (!roleName) {
        return interaction.reply({ content: 'No appropriate role found for the given playtime.', ephemeral: true });
      }

      const role = guildMember.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        return interaction.reply({ content: `Role "${roleName}" not found in the server.`, ephemeral: true });
      }

      if (!guildMember.roles.cache.has(role.id)) {
        await guildMember.roles.add(role);
        return interaction.reply({
          content: `Assigned the "${roleName}" role to ${guildMember.user.tag} for ${playtime} hours of playtime.`,
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: `${guildMember.user.tag} already has the "${roleName}" role.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error in updateplaytime command:', error);
      return interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
    }
  }

  // Calculate Machines Needed Command
  if (commandName === 'calculatemachinesneeded') {
    try {
      const machineName = interaction.options.getString('machine_name');
      const itemName = interaction.options.getString('item_name');
      const itemsNeeded = interaction.options.getNumber('items_needed');
      const machineProcessSpeed = interaction.options.getNumber('machine_process_speed');

      // Validate inputs
      if (!machineName || !itemName || itemsNeeded <= 0 || machineProcessSpeed <= 0) {
        return interaction.reply({
          content: 'Please ensure all inputs are valid and greater than zero.',
          ephemeral: true,
        });
      }

      const fullMachinesNeeded = Math.floor(itemsNeeded / machineProcessSpeed);
      const remainder = itemsNeeded % machineProcessSpeed;
      const percentOfAMachineNeeded = (remainder / machineProcessSpeed) * 100;

      // Construct the response
      let reply = `To produce ${itemsNeeded} ${itemName}/min, you need ${fullMachinesNeeded} ${machineName}(s) at 100% efficiency.`;
      if (remainder > 0) {
        reply += ` Additionally, one ${machineName} will need to operate at ${percentOfAMachineNeeded.toFixed(2)}% efficiency.`;
      }

      return interaction.reply({ content: reply, ephemeral: true });
    } catch (error) {
      console.error('Error in calculatemachinesneeded command:', error);
      return interaction.reply({
        content: 'An error occurred while calculating machines needed. Please try again later.',
        ephemeral: true,
      });
    }
  }
});

/**
 * Start the bot
 */
client.once('ready', async () => {
  console.log('Bot is online!');

  // Clear all existing commands
  await clearCommands();

  // Register new commands globally
  await registerCommands();
});

client.login(token);
