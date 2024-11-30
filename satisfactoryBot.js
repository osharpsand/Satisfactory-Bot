console.log('Starting');

const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { CalculateCompleteManifoldData } = require('./manifoldUtils.js');
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
  const commands = require("./commands.js").commands;
  
  try {
    client.application.commands.set(commands);
    console.log('Global commands set to:', commands);

  } catch (error) {
    console.error('Error registering commands:', error);
  }
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
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (welcomeChannel) {
      await welcomeChannel.send(`Welcome to the server, ${member.user.tag}!`);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'updateplaytime') {
    try {
      // Check if the user is the server owner
      if (interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({
          content: 'You do not have permission to use this command. Only the server owner can execute this action.',
          ephemeral: true,
        });
      }

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
  } catch (error) {
      console.error('Error in updateplaytime command:', error);
      await interaction.reply({
        content: 'An error occurred while updating playtime. Please try again later.',
        ephemeral: true,
      });
  } 
} else if (commandName === 'calculatemachinesneeded') {
    try {
      const machineName = interaction.options.getString('machine_name');
      const itemName = interaction.options.getString('item_name');
      const itemsNeeded = interaction.options.getNumber('items_needed');
      const machineProcessSpeed = interaction.options.getNumber('machine_process_speed');

      if (!machineName || !itemName || itemsNeeded <= 0 || machineProcessSpeed <= 0) {
        return interaction.reply({
          content: 'Please ensure all inputs are valid and greater than zero.',
          ephemeral: true,
        });
      }

      const fullMachinesNeeded = Math.floor(itemsNeeded / machineProcessSpeed);
      const remainder = itemsNeeded % machineProcessSpeed;
      const percentOfAMachineNeeded = (remainder / machineProcessSpeed) * 100;

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
  } else if (commandName === 'completebreakdown') {
    try {
      const machineName = interaction.options.getString('machine_name');
      const machinePower = interaction.options.getNumber('machine_power');
      const itemName = interaction.options.getString('item_name');
      const outputSpeed = interaction.options.getNumber('total_production_speed');
      const processSpeed = interaction.options.getNumber('process_speed');
      const maxBeltSpeed = interaction.options.getNumber('max_belt_speed');
      const maxPipeSpeed = interaction.options.getNumber('max_pipe_speed');
      const solidOutput = interaction.options.getBoolean('solid_output');

      const inputItems = [];
      for (let i = 1; i <= 4; i++) {
        const inputData = interaction.options.getString(`input_item_${i}`);
        if (inputData) {
          const [itemName, usageSpeed, isSolid] = inputData.split(',');
          inputItems.push({
            itemName: itemName.trim(),
            usageSpeed: parseFloat(usageSpeed.trim()),
            isSolid: isSolid ? isSolid.trim().toLowerCase() === 'true' : undefined,
          });
        }
      }

      const breakdownMessage = CalculateCompleteManifoldData(
        machineName,
        machinePower,
        itemName,
        outputSpeed,
        processSpeed,
        maxBeltSpeed,
        maxPipeSpeed,
        solidOutput ?? true,
        inputItems
      );

      await interaction.reply({ content: breakdownMessage, ephemeral: true });
    } catch (error) {
      console.error('Error in completebreakdown command:', error);
      await interaction.reply({
        content: "An error occurred while calculating the complete breakdown. Please make sure the command you enter has all the important data. Also it is possible I got updated and my commands aren't working right now. Try again in 30 minutes.",
        ephemeral: true,
      });
    }
  }
});

client.once('ready', async () => {
  console.log('Bot is online!');
  await registerCommands();
});

client.login(token);
