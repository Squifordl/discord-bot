const { InteractionType } = require('discord.js');

module.exports = class InteractionCreateEvent {
  constructor(client) {
    this.client = client;
  }

  async run(interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = this.client.slashCommands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: 'Oops! Não encontrei este comando.', ephemeral: true });
    }

    if (!interaction.member) {
      interaction.member = await interaction.guild.members.fetch(interaction.user.id);
    }

    try {
      await command.run(this.client, interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Houve um erro ao executar este comando.', ephemeral: true });
      }
    }
  }
};
