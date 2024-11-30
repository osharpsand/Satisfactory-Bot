const { SlashCommandBuilder } = require('discord.js');

exports.commands = [
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
      option.setName('machine_name') // Ensure valid option names
        .setDescription('Name of the machine')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('item_name') // Ensure valid option names
        .setDescription('Name of the item')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('items_needed') // Ensure valid option names
        .setDescription('Items to produce per minute')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('machine_process_speed') // Ensure valid option names
        .setDescription('Items one machine produces per minute')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('completebreakdown')
    .setDescription('Calculate a complete manifold breakdown for production')
    .addStringOption(option =>
      option.setName('machine_name')
        .setDescription('Name of the machine')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('machine_power')
        .setDescription('Machine power required per minute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('item_name')
        .setDescription('Name of the item to produce')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('total_production_speed')
        .setDescription('Speed of output per minute')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('process_speed')
        .setDescription('Processing speed per machine per minute')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('max_belt_speed')
        .setDescription('Maximum belt speed for output')
        .setRequired(false))
    .addNumberOption(option =>
      option.setName('max_pipe_speed')
        .setDescription('Maximum pipe speed for output')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('solid_output')
        .setDescription('Is the output solid? (True/False)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('input_item_1')
        .setDescription('First input item (itemName, usageSpeed, optional isSolid)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('input_item_2')
        .setDescription('Second input item (itemName, usageSpeed, optional isSolid)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('input_item_3')
        .setDescription('Third input item (itemName, usageSpeed, optional isSolid)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('input_item_4')
        .setDescription('Fourth input item (itemName, usageSpeed, optional isSolid)')
        .setRequired(false))
].map(command => command.toJSON());


