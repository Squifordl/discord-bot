const Guild = require("../database/Schemas/Guild"),
  User = require("../database/Schemas/User"),
  GuildUser = require("../database/Schemas/GuildUser")

module.exports = class ready {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.database.users = User;
    this.client.database.guilds = Guild;
    this.client.database.guilduser = GuildUser;
  }
};
