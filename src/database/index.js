const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

module.exports = {
  start() {
    mongoose.connect(process.env.DATABASE_CONNECT);
    mongoose.connection.on("connected", () => console.log("[DataBase] - Conectado ao Banco de Dados."));
    mongoose.connection.on("disconnected", () => console.log("[DataBase] - Desconectado do Banco de Dados."));
    mongoose.connection.on("error", (err) => console.error(`[DataBase] - Erro: ${err}`));
  }
};
