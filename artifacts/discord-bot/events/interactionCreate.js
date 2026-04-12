const config = require("../config.js");
const { InteractionType, MessageFlags } = require('discord.js');
const path = require("path");
const colors = require('../UI/colors/colors');
const { getLang, getLangSync } = require('../utils/languageLoader.js');
const { safeDeferUpdate } = require('../utils/responseHandler');

module.exports = async (client, interaction) => {
  try {

    if (interaction.type === InteractionType.ApplicationCommand) {
    if (!interaction?.guild) {
        const lang = getLang(interaction.guildId);
        return interaction?.reply({ 
          content: lang.events.interactionCreate.noGuild, 
          flags: MessageFlags.Ephemeral 
        });
    }

      const lang = getLang(interaction.guildId);
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        const consoleLang = getLangSync();
        console.error(`${colors.cyan}[ INTERACTION ]${colors.reset} ${colors.red}${consoleLang.console?.events?.interaction?.commandNotFound?.replace('{commandName}', interaction.commandName) || `Command not found: ${interaction.commandName}`}${colors.reset}`);
        return interaction?.reply({ 
          content: lang.events.interactionCreate.commandNotFound, 
          flags: MessageFlags.Ephemeral 
        });
      }

      const requiredPermissions = command.permissions || "0x0000000000000800";
      if (!interaction?.member?.permissions?.has(requiredPermissions)) {
        return interaction?.reply({ 
          content: lang.events.interactionCreate.noPermission, 
          flags: MessageFlags.Ephemeral 
        });
      }

  
      try {
        await command.run(client, interaction);
      } catch (error) {
        const consoleLang = getLangSync();
        console.error(`${colors.cyan}[ INTERACTION ]${colors.reset} ${colors.red}${consoleLang.console?.events?.interaction?.errorExecuting?.replace('{commandName}', interaction.commandName) || `Error executing command ${interaction.commandName}:`}${colors.reset}`, error);
        
        const errorMessage = lang.events.interactionCreate.errorOccurred.replace('{message}', error.message);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: errorMessage, 
            flags: MessageFlags.Ephemeral 
          }).catch(() => {});
        } else {
          await interaction.reply({ 
            content: errorMessage, 
            flags: MessageFlags.Ephemeral 
          }).catch(() => {});
        }
      }
    }

   
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('help_')) {
        try {
          const deferred = await safeDeferUpdate(interaction);
          if (!deferred && !interaction.deferred && !interaction.replied) return;
          const helpCommand = client.commands.get('help');
          if (helpCommand && helpCommand.helpers?.handleComponent) {
            return await helpCommand.helpers.handleComponent(client, interaction);
          }
        } catch (error) {
          const consoleLang = getLangSync();
          console.error(consoleLang.console?.events?.interaction?.errorHelpButton || 'Error handling help interaction button:', error);
          const lang = getLang(interaction.guildId);
          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({ content: lang.events.interactionCreate.errorTryAgain, flags: MessageFlags.Ephemeral });
            } else {
              await interaction.followUp({ content: lang.events.interactionCreate.errorTryAgain, flags: MessageFlags.Ephemeral });
            }
          } catch (e) {}
        }
        return;
      }
    }

  
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('help_') || interaction.customId === 'help_category_select') {
        try {
          const deferred = await safeDeferUpdate(interaction);
          if (!deferred && !interaction.deferred && !interaction.replied) return;
          const helpCommand = client.commands.get('help');
          if (helpCommand && helpCommand.helpers?.handleComponent) {
            return await helpCommand.helpers.handleComponent(client, interaction);
          }
        } catch (error) {
          const consoleLang = getLangSync();
          console.error(consoleLang.console?.events?.interaction?.errorHelpSelect || 'Error handling help interaction select:', error);
          const lang = getLang(interaction.guildId);
          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({ content: lang.events.interactionCreate.errorTryAgain, flags: MessageFlags.Ephemeral });
            } else {
              await interaction.followUp({ content: lang.events.interactionCreate.errorTryAgain, flags: MessageFlags.Ephemeral });
            }
          } catch (e) {}
        }
        return;
      }
    }

  } catch (error) {
    const consoleLang = getLangSync();
    console.error(`${colors.cyan}[ INTERACTION ]${colors.reset} ${colors.red}${consoleLang.console?.events?.interaction?.unexpectedError || 'Unexpected error:'}${colors.reset}`, error);
    
    const lang = getLang(interaction.guildId);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: lang.events.interactionCreate.unexpectedError, 
          flags: MessageFlags.Ephemeral 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: lang.events.interactionCreate.unexpectedError, 
          flags: MessageFlags.Ephemeral 
        }).catch(() => {});
      }
    } catch (replyError) {
      console.error(`${colors.cyan}[ INTERACTION ]${colors.reset} ${colors.red}${consoleLang.console?.events?.interaction?.failedToSendError || 'Failed to send error message:'}${colors.reset}`, replyError);
    }
  }
};
