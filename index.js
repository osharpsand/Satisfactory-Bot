console.log('Starting');

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
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
  ],
});

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
        option.setName('machine name')
          .setDescription('Name of the machine')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('item name')
          .setDescription('Name of the item')
          .setRequired(true))
      .addNumberOption(option => 
        option.setName('items needed')
          .setDescription('Items to produce per minute')
          .setRequired(true))
      .addNumberOption(option => 
        option.setName('machine process speed')
          .setDescription('Items one machine produces per minute')
          .setRequired(true)),
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
}

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

client.on('guildMemberAdd', async (member) => {
  const roleName = 'Satisfactory Player';
  const role = member.guild.roles.cache.find(role => role.name === roleName);
  if (role && !member.roles.cache.has(role.id)) {
    await member.roles.add(role);
    const generalChannel = member.guild.channels.cache.find(ch => ch.name === 'general');
    if (generalChannel) {
      await generalChannel.send(`Welcome to the server, ${member.user.tag}!`);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'updateplaytime') {
    const member = interaction.options.getUser('member');
    const playtime = interaction.options.getInteger('playtime');
    if (member && playtime !== null) {
      const guildMember = await interaction.guild.members.fetch(member.id);
      await assignRoleBasedOnPlaytime(guildMember, playtime);
      await interaction.reply({
        content: `Updated role for ${guildMember.user.tag} with ${playtime} hours of playtime.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'Invalid inputs provided.', ephemeral: true });
    }
  } else if (commandName === 'calculatemachinesneeded') {
    try {
      const machineName = interaction.options.getString('machine name');
      const itemName = interaction.options.getString('item name');
      const itemsNeeded = interaction.options.getNumber('items needed');
      const machineProcessSpeed = interaction.options.getNumber('machine process speed');
  
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
  
      // Construct reply
      let reply = `To make ${itemsNeeded} ${itemName}/min, you need ${fullMachinesNeeded} ${machineName}(s) at 100% efficiency.`;
      if (remainder > 0) {
        reply += ` Additionally, one ${machineName} will need to operate at ${percentOfAMachineNeeded.toFixed(5)}% efficiency.`;
      }
  
      await interaction.reply({ content: reply, ephemeral: true });
    } catch (error) {
      console.error('Error in calculatemachinesneeded command:', error);
      await interaction.reply({
        content: 'An error occurred while calculating machines needed. Please try again later.',
        ephemeral: true,
      });
  }
}

  }
});

client.once('ready', async () => {
  console.log('Bot is online!');
  await registerCommands();
});

client.login(token);

