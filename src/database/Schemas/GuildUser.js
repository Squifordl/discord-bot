const mongoose = require("mongoose");

const guildUserSchema = new mongoose.Schema({
  idU: String,
  idS: String,
  lady: {
    dama: {
      type: Array,
      default: []
    },
    recebeu: {
      status: {
        type: Boolean,
        default: false
      },
      user: {
        type: String,
        default: "null"
      }
    }
  }
});

const GuildUser = mongoose.model("GuildUser", guildUserSchema);
module.exports = GuildUser;
