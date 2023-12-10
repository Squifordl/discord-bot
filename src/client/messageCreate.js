const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = class MessageCreateEvent {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    moment.locale("pt-BR");

    if (message.author.bot || message.channel.type === "DM" || message.content === " ") return;

    const serverID = message.guild.id;
    const { prefix, colorembed } = await this.fetchServerData(serverID, message);
    const hasMentionedBot = message.content.startsWith(`<@!${this.client.user.id}>`);

    if (hasMentionedBot) {
      return this.handleMention(message, prefix, colorembed);
    }

    if (!message.content.startsWith(prefix)) return;

    const [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = this.client.commands.get(commandName.toLowerCase())
      || this.client.commands.get(this.client.aliases.get(commandName.toLowerCase()));

    if (command) {
      this.logCommandUsage(command, message);
      command.run({ message, args, prefix, author: message.author });
    }
  }

  async fetchServerData(serverID, message) {
    let server = await this.client.database.guilds.findOne({ idS: serverID });
    if (!server) {
      server = await this.client.database.guilds.create({ idS: serverID });
    }

    await this.ensureUserDataExists(message.author.id, serverID);

    return {
      prefix: server.prefix,
      colorembed: server.colorembed.color || "#d900ad"
    };
  }

  async ensureUserDataExists(userID, serverID) {
    await this.client.database.users.findOneAndUpdate(
      { idU: userID },
      {},
      { upsert: true, new: true }
    );

    await this.client.database.guilduser.findOneAndUpdate(
      { idU: userID, idS: serverID },
      {},
      { upsert: true, new: true }
    );
  }

  handleMention(message, prefix, embedColor) {
    const embed = new EmbedBuilder()
      .setDescription(`Olá ${message.author}, meu prefixo no servidor é \`${prefix}\`, use \`${prefix}ajuda\` para ver meus comandos.`)
      .setColor(embedColor);

    message.reply({ embeds: [embed] });
  }

  logCommandUsage(command, message) {
    console.log(
      `[COMANDO] ${message.author.tag} (${message.author.id}) usou o comando ${command.name} no servidor ` +
      `${message.guild.name} (${message.guild.id}) no canal ${message.channel.name} (${message.channel.id})`
    );
  }
};
