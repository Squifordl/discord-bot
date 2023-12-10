const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  idS: String,
  prefix: {
    type: String,
    default: "ss!"
  },
  colorembed: {
    color: {
      type: String,
      default: "#d900ad"
    }
  },
  dama: {
    perm: {
      type: Array,
      default: []
    },
    lady: {
      type: String,
      default: "null"
    },
    msg: {
      type: String,
      default: "null"
    },
    canal: {
      type: String,
      default: "null"
    }
  },
});

const Guild = mongoose.model("Guild", guildSchema);
module.exports = Guild;
