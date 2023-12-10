const Discord = require("discord.js");

module.exports = class ClientEmbed extends Discord.EmbedBuilder {
  constructor(user, guild, data = {}) {
    super(data);
    this.setTimestamp();
    this.setColor(!guild.idS ? process.env.EMBED_COLOR : guild.colorembed.color);
    this.setFooter({
      text: `Requisitado por ${user.tag}`,
      iconURL: user.displayAvatarURL({ dynamic: true })
    });
  }
};
