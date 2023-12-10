const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
require('dotenv').config();
const klaw = require("klaw");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

class Squiford extends Client {
  constructor(options) {
    super(options);

    this.client = options;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.database = new Collection();
    this.embed = new Collection();
    this.slashCommands = new Collection();
    this.subcommands = new Collection();
  }
  async login(token) {
    token = process.env.TOKEN;
    await super.login(token);
  }

  load(commandPath, commandName) {
    const props = new (require(`${commandPath}/${commandName}`))(this);
    if (props.isSub) {
      if (!this.subcommands.get(props.reference)) {
        this.subcommands.set(props.reference, new Collection());
      }
      this.subcommands.get(props.reference).set(props.name, props);
    }
    if (props.isSub) return;
    props.location = commandPath;
    if (props.init) {
      props.init(this);
    }
    this.commands.set(props.name, props);
    props.aliases.forEach((aliases) => {
      this.aliases.set(aliases, props.name);
    });
    return false;
  }
}

const client = new Squiford({
  intents: [
    1,
    512,
    32768,
    2,
    128,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.GuildMember,
    Partials.User,
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.Guild,
    Partials.Role,
    Partials.Emoji,
    Partials.Invite,
    Partials.MessageReaction,
    Partials.Presence,
    Partials.ThreadMember,
    Partials.ThreadChannel,
    Partials.Webhook
  ],
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true
  },
  shards: "auto"
});

const onLoad = async () => {
  const db = require("../src/database/index.js");
  db.start();

  klaw("src/commands").on("data", (item) => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = client.load(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
    if (response) return;
  });

  const eventFiles = await readdir(`./src/client/`);
  eventFiles.forEach((file) => {
    const eventName = file.split(".")[0];
    const event = new (require(`./client/${file}`))(client);
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./client/${file}`)];
  });
  client.login();
};

onLoad();
client.slashCommands = new Collection();
require("./handler")(client);

module.exports = client;
