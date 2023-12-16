const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ping";
    this.category = "Informação";
    this.description = "Comando para olhar o ping da host do bot";
    this.usage = "ping";
    this.aliases = ["pong"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message }) {
    const ping = Math.ceil(this.client.ws.ping) + "ms";

    const embed = new ClientEmbed(message.author, server).setDescription(`Ping do Bot: **${ping}**`);
    message.channel.send({ embeds: [embed] });
  }
};
