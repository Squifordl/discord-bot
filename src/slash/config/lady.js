const ClientEmbed = require("../../structures/ClientEmbed");
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
let limiteUser;
const { time } = require("discord.js");
module.exports = {
  name: "lady",
  description: "Sistema de Primeira Dama.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "gerenciar",
      description: "Forneceça uma opção.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Controle", value: "member" },
        { name: "Configuração", value: "gerenciar" },
        { name: "Damas", value: "list" }
      ]
    }
  ],
  run: async (client, interaction, args) => {
    const toggle = interaction.options.getString("gerenciar");
    if (toggle === "gerenciar") {
      const server = await client.database.guilds.findOne({
        idS: interaction.guild.id
      });
      if (!interaction.member.permissions.has("Administrator"))
        return interaction.reply({
          content: "Você não tem permissão para executar este comando.",
          ephemeral: true
        });
      const lite = {
        0: "1",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
        13: "13",
        14: "14",
        15: "15"
      };
      const rowprincipal = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("lady")
          .setPlaceholder("Selecione uma opção")
          .addOptions([
            {
              label: "Cargo de Primeira Dama",
              description: "Selecione para editar o cargo.",
              value: "role"
            },
            {
              label: "Cargos com Permissão",
              description: "Selecione para editar os cargos.",
              value: "roles"
            }
          ])
      );
      let list = server.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
      const embedprincipal = new ClientEmbed(interaction.user, server)
        .setAuthor({
          name: "Sistema de Primeira Dama",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          url: "https://discord.gg/squiford"
        })
        .setDescription(
          "**[Clique aqui para ver um tutorial.](https://www.youtube.com/watch?v=sO3xrxbcaTM)**\nAqui você pode configurar o sistema de Primeira Dama.\nReaja abaixo para configurar."
        )
        .addFields(
          {
            name: "Cargo de Primeira Dama",
            value: server.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${server.dama.lady}>`
          },
          {
            name: "Cargos com permissão para o sistema",
            value: server.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
          }
        );
      const reply = await interaction.reply({
        embeds: [embedprincipal],
        components: [rowprincipal],
        fetchReply: true
      });
      const filter = (i) => i.isStringSelectMenu() && i.message.id === reply.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter: filter
      });
      collector.on("collect", async (int) => {
        if (int.user.id !== interaction.user.id) {
          int.update({});
        }
        if (int.user.id == interaction.user.id) {
          await int.update({});
          switch (int.values[0]) {
            case "role":
              {
                const row = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("editrole")
                    .setLabel(server.dama.lady === "null" ? "Adicionar Cargo" : "Editar Cargo")
                    .setStyle("Primary")
                    .setDisabled(false),
                  new ButtonBuilder()
                    .setCustomId("removerole")
                    .setLabel("Remover Cargo")
                    .setStyle("Danger")
                    .setDisabled(server.dama.lady === "null" ? true : false),
                  new ButtonBuilder()
                    .setCustomId("list")
                    .setLabel("Listar Membros")
                    .setStyle("Secondary")
                    .setDisabled(server.dama.lady === "null" ? true : false),
                  new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                );
                const embedcargo = new ClientEmbed(interaction.user, server)
                  .setAuthor({
                    name: "Sistema de Primeira Dama",
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    url: "https://discord.gg/squiford"
                  })
                  .setDescription("Aqui você pode configurar o cargo de Primeira Dama.\nReaja abaixo para configurar.")
                  .addFields({
                    name: "Cargo de Primeira Dama",
                    value: server.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${server.dama.lady}>`
                  });
                await int.message.edit({
                  content: null,
                  embeds: [embedcargo],
                  components: [row],
                  fetchReply: true
                });
                const filter = (i) => i.isButton() && i.message.id === reply.id;
                const collectorLadyPrincipal = interaction.channel.createMessageComponentCollector({
                  filter: filter
                });
                collectorLadyPrincipal.on("collect", async (int) => {
                  if (int.user.id == interaction.user.id) {
                    await int.update({});
                    switch (int.customId) {
                      case "editrole":
                        {
                          const server = await client.database.guilds.findOne({
                            idS: interaction.guild.id
                          });
                          const embed = new ClientEmbed(interaction.user, server).setDescription(
                            `${int.user}, marque o cargo ou envie o ID no chat para ${server.dama.lady === "null" ? "Adicionar" : "Editar"} como Primeira Dama.`
                          );
                          int.message.edit({
                            content: null,
                            components: [],
                            embeds: [embed],
                            fetchReply: true
                          });
                          const filter = (m) => m.author.id === interaction.user.id;
                          const collectorLady = interaction.channel.createMessageCollector({
                            filter: filter,
                            max: 3,
                            time: 60000
                          });
                          collectorLady.on("collect", async (m) => {
                            const server = await client.database.guilds.findOne({ idS: m.guild.id });
                            m.delete();
                            const role = m.mentions.roles.first() || interaction.guild.roles.cache.get(m.content);
                            if (!role) {
                              const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, você não mencionou um cargo ou enviou um ID válido.`);
                              return int.message.edit({
                                content: null,
                                components: [],
                                embeds: [embed],
                                fetchReply: true
                              });
                            }
                            if (server.dama.lady === role.id) {
                              const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, o cargo de Primeira Dama já é esse.`);
                              return int.message.edit({
                                content: null,
                                components: [],
                                embeds: [embed],
                                fetchReply: true
                              });
                            }

                            if (!role.editable) {
                              collectorLady.stop();
                              const embed = new ClientEmbed(interaction.user, server).setDescription(
                                `${int.user}, você ${server.dama.lady === "null" ? "Adicionou" : "Editou"} o cargo de Primeira Dama com sucesso para <@&${role.id}>.\n**Porém eu nao consigo gerenciar esse cargo, suba o meu cargo para funcionar corretamente o sistema.`
                              );
                              int.followUp({
                                embeds: [embed],
                                ephemeral: true
                              });

                              const newrole = await client.database.guilds.findOneAndUpdate({ idS: interaction.guild.id }, { $set: { "dama.lady": role.id } }, { new: true });
                              const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                  .setCustomId("editrole")
                                  .setLabel(newrole.dama.lady === "null" ? "Adicionar Cargo" : "Editar Cargo")
                                  .setStyle("Primary")
                                  .setDisabled(false),
                                new ButtonBuilder()
                                  .setCustomId("removerole")
                                  .setLabel("Remover Cargo")
                                  .setStyle("Danger")
                                  .setDisabled(newrole.dama.lady === "null" ? true : false),
                                new ButtonBuilder()
                                  .setCustomId("list")
                                  .setLabel("Listar Membros")
                                  .setStyle("Secondary")
                                  .setDisabled(newrole.dama.lady === "null" ? true : false),
                                new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                              );
                              const embedcargo = new ClientEmbed(interaction.user, server)
                                .setAuthor({
                                  name: "Sistema de Primeira Dama",
                                  iconURL: client.user.displayAvatarURL({
                                    dynamic: true
                                  }),
                                  url: "https://discord.gg/squiford"
                                })
                                .setDescription("Aqui você pode configurar o cargo de Primeira Dama.\nReaja abaixo para configurar.")
                                .addFields({
                                  name: "Cargo de Primeira Dama",
                                  value: newrole.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${newrole.dama.lady}>`
                                });
                              int.message.edit({
                                content: null,
                                embeds: [embedcargo],
                                components: [row],
                                fetchReply: true
                              });
                            } else {
                              collectorLady.stop();
                              const embed = new ClientEmbed(interaction.user, server).setDescription(
                                `${int.user}, você ${server.dama.lady === "null" ? "Adicionou" : "Editou"} o cargo de Primeira Dama com sucesso para <@&${role.id}>.`
                              );
                              int.followUp({
                                embeds: [embed],
                                ephemeral: true
                              });

                              const newrole = await client.database.guilds.findOneAndUpdate({ idS: interaction.guild.id }, { $set: { "dama.lady": role.id } }, { new: true });
                              const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                  .setCustomId("editrole")
                                  .setLabel(newrole.dama.lady === "null" ? "Adicionar Cargo" : "Editar Cargo")
                                  .setStyle("Primary")
                                  .setDisabled(false),
                                new ButtonBuilder()
                                  .setCustomId("removerole")
                                  .setLabel("Remover Cargo")
                                  .setStyle("Danger")
                                  .setDisabled(newrole.dama.lady === "null" ? true : false),
                                new ButtonBuilder()
                                  .setCustomId("list")
                                  .setLabel("Listar Membros")
                                  .setStyle("Secondary")
                                  .setDisabled(newrole.dama.lady === "null" ? true : false),
                                new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                              );
                              const embedcargo = new ClientEmbed(interaction.user, server)
                                .setAuthor({
                                  name: "Sistema de Primeira Dama",
                                  iconURL: client.user.displayAvatarURL({
                                    dynamic: true
                                  }),
                                  url: "https://discord.gg/squiford"
                                })
                                .setDescription("Aqui você pode configurar o cargo de Primeira Dama.\nReaja abaixo para configurar.")
                                .addFields({
                                  name: "Cargo de Primeira Dama",
                                  value: newrole.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${newrole.dama.lady}>`
                                });
                              int.message.edit({
                                content: null,
                                embeds: [embedcargo],
                                components: [row],
                                fetchReply: true
                              });
                            }
                          });
                        }
                        break;
                      case "removerole":
                        {
                          const server = await client.database.guilds.findOne({
                            idS: interaction.guild.id
                          });
                          const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, cargo removido com sucesso!?`);
                          int.followUp({ embeds: [embed], ephemeral: true });
                          const newrole = await client.database.guilds.findOneAndUpdate({ idS: interaction.guild.id }, { $set: { "dama.lady": "null" } }, { new: true });
                          const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                              .setCustomId("editrole")
                              .setLabel(newrole.dama.lady === "null" ? "Adicionar Cargo" : "Editar Cargo")
                              .setStyle("Primary")
                              .setDisabled(false),
                            new ButtonBuilder()
                              .setCustomId("removerole")
                              .setLabel("Remover Cargo")
                              .setStyle("Danger")
                              .setDisabled(newrole.dama.lady === "null" ? true : false),
                            new ButtonBuilder()
                              .setCustomId("list")
                              .setLabel("Listar Membros")
                              .setStyle("Secondary")
                              .setDisabled(newrole.dama.lady === "null" ? true : false),
                            new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                          );
                          const embedcargo = new ClientEmbed(interaction.user, server)
                            .setAuthor({
                              name: "Sistema de Primeira Dama",
                              iconURL: client.user.displayAvatarURL({
                                dynamic: true
                              }),
                              url: "https://discord.gg/squiford"
                            })
                            .setDescription("Aqui você pode configurar o cargo de Primeira Dama.\nReaja abaixo para configurar.")
                            .addFields({
                              name: "Cargo de Primeira Dama",
                              value: newrole.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${newrole.dama.lady}>`
                            });
                          int.message.edit({
                            content: null,
                            components: [row],
                            embeds: [embedcargo],
                            fetchReply: true
                          });
                        }
                        break;
                      case "list":
                        {
                          const server = await client.database.guilds.findOne({
                            idS: interaction.guild.id
                          });
                          const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, vou fazer quando tiver pronto o restante, esse é chato`);
                          int.followUp({ embeds: [embed], ephemeral: true });
                        }
                        break;
                      case "voltar":
                        {
                          const server = await client.database.guilds.findOne({
                            idS: interaction.guild.id
                          });
                          let list = server.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                          const embedprincipal = new ClientEmbed(interaction.user, server)
                            .setAuthor({
                              name: "Sistema de Primeira Dama",
                              iconURL: client.user.displayAvatarURL({
                                dynamic: true
                              }),
                              url: "https://discord.gg/squiford"
                            })
                            .setDescription("Aqui você pode configurar o sistema de Primeira Dama.\nReaja abaixo para configurar.")
                            .addFields(
                              {
                                name: "Cargo de Primeira Dama",
                                value: server.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${server.dama.lady}>`
                              },
                              {
                                name: "Cargos com permissão para o sistema",
                                value: server.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                              }
                            );
                          int.message.edit({
                            content: null,
                            embeds: [embedprincipal],
                            components: [rowprincipal],
                            fetchReply: true
                          });
                          collectorLadyPrincipal.stop();
                        }
                        break;
                    }
                  }
                });
              }
              break;
            case "roles": {
              const server = await client.database.guilds.findOne({
                idS: interaction.guild.id
              });
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("editrole").setLabel("Adicionar Cargo").setStyle("Primary").setDisabled(false),
                new ButtonBuilder().setCustomId("limit").setLabel("Gerenciar Limite").setStyle("Secondary").setDisabled(false),
                new ButtonBuilder()
                  .setCustomId("removerole")
                  .setLabel("Remover Cargo")
                  .setStyle("Danger")
                  .setDisabled(server.dama.perm.length == 0 ? true : false),
                new ButtonBuilder()
                  .setCustomId("list")
                  .setLabel("Listar Membros")
                  .setStyle("Secondary")
                  .setDisabled(server.dama.lady === "null" ? true : false),
                new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
              );
              let list = server.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
              const embedcargo = new ClientEmbed(interaction.user, server)
                .setAuthor({
                  name: "Sistema de Primeira Dama",
                  iconURL: client.user.displayAvatarURL({ dynamic: true }),
                  url: "https://discord.gg/squiford"
                })
                .setDescription("Aqui você pode configurar os cargo que possuem permissão para o sistema.\nReaja abaixo para configurar.")
                .addFields({
                  name: "Cargos com Permissão",
                  value: server.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                });
              await int.message.edit({
                content: null,
                embeds: [embedcargo],
                components: [row],
                fetchReply: true
              });
              const filter = (i) => i.isButton() && i.message.id === reply.id;
              const collectorPermPrincipal = interaction.channel.createMessageComponentCollector({
                filter: filter
              });
              collectorPermPrincipal.on("collect", async (int) => {
                if (int.user.id == interaction.user.id) {
                  await int.update({});
                  switch (int.customId) {
                    case "editrole":
                      {
                        const server = await client.database.guilds.findOne({
                          idS: interaction.guild.id
                        });
                        const embed = new ClientEmbed(interaction.user, server).setDescription(
                          `${int.user}, marque o cargo ou envie o ID no chat para Adicionar como permissão de Primeira Dama.\n\nVocê pode enviar mais de um cargo. Exemplo: @cargo @cargo2 @cargo3`
                        );
                        int.message.edit({
                          content: null,
                          components: [],
                          embeds: [embed],
                          fetchReply: true
                        });
                        const filter = (m) => m.author.id === interaction.user.id;
                        const collectPerm = interaction.channel.createMessageCollector({
                          filter: filter,
                          max: 3,
                          time: 60000
                        });
                        collectPerm.on("collect", async (m) => {
                          m.delete();
                          const role = m.mentions.roles.size
                            ? m.mentions.roles.map((x) => m.guild.roles.cache.get(x.id))
                            : m.content
                              .split(/\s+/)
                              .filter((id) => m.guild.roles.cache.has(id))
                              .map((id) => m.guild.roles.cache.get(id));
                          if (role.toString() == [""] || !role || role.toString() == "") {
                            const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, você não marcou um cargo ou enviou um ID válido para cargo.`);
                            return int.message.edit({
                              content: null,
                              components: [],
                              embeds: [embed],
                              fetchReply: true
                            });
                          }
                          collectPerm.stop();
                          const verifyRole = role.filter((role) => !server.dama.perm.find(({ id }) => id.includes(role.id)));
                          for (const role of verifyRole) {
                            await client.database.guilds.findOneAndUpdate(
                              { idS: interaction.guild.id },
                              {
                                $push: {
                                  "dama.perm": {
                                    id: role.id,
                                    limit: 1
                                  }
                                }
                              }
                            );
                          }
                          const sexo = await client.database.guilds.findOne({
                            idS: interaction.guild.id
                          });
                          const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("editrole").setLabel("Adicionar Cargo").setStyle("Primary").setDisabled(false),
                            new ButtonBuilder().setCustomId("limit").setLabel("Gerenciar Limite").setStyle("Secondary").setDisabled(false),
                            new ButtonBuilder()
                              .setCustomId("removerole")
                              .setLabel("Remover Cargo")
                              .setStyle("Danger")
                              .setDisabled(sexo.dama.perm.length == 0 ? true : false),
                            new ButtonBuilder()
                              .setCustomId("list")
                              .setLabel("Listar Membros")
                              .setStyle("Secondary")
                              .setDisabled(sexo.dama.lady === "null" ? true : false),
                            new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                          );
                          let list = sexo.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                          const embedcargo = new ClientEmbed(interaction.user, server)
                            .setAuthor({
                              name: "Sistema de Primeira Dama",
                              iconURL: client.user.displayAvatarURL({
                                dynamic: true
                              }),
                              url: "https://discord.gg/squiford"
                            })
                            .setDescription("Aqui você pode configurar os cargo que possuem permissão para o sistema.\nReaja abaixo para configurar.")
                            .addFields({
                              name: "Cargos com Permissão",
                              value: sexo.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                            });
                          int.message.edit({
                            content: null,
                            embeds: [embedcargo],
                            components: [row],
                            fetchReply: true
                          });
                        });
                      }
                      break;
                    case "limit":
                      {
                        const server = await client.database.guilds.findOne({
                          idS: interaction.guild.id
                        });
                        const buttons = server.dama.perm.map((perm) => ({
                          label: interaction.guild.roles.cache.find((r) => r.id === perm.id).name,
                          description: `ID: ${perm.id}`,
                          value: perm.id
                        }));
                        const roww = new ActionRowBuilder().addComponents(
                          new StringSelectMenuBuilder().setCustomId("ladyremovercargo").setPlaceholder("Selecione uma opção").addOptions(buttons)
                        );
                        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false));
                        const embed = new ClientEmbed(interaction.user, server).setDescription("Selecione o cargo que deseja alterar o limite de membros.");
                        const reply = await int.message.edit({
                          embeds: [embed],
                          components: [roww, row],
                          content: null,
                          fetchReply: true
                        });
                        const filter = (i) => i.message.id === reply.id;
                        const collectorLimit1 = interaction.channel.createMessageComponentCollector({
                          filter: filter
                        });
                        collectorLimit1.on("collect", async (int) => {
                          if (int.user.id == interaction.user.id) {
                            if (int.customId == "ladyremovercargo") {
                              await int.values.forEach(async (v) => {
                                const rolesexo = interaction.guild.roles.cache.get(v);
                                const limit = server.dama.perm.find(({ id }) => id.includes(rolesexo.id));
                                const row = new ActionRowBuilder().addComponents(
                                  new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                                );
                                let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

                                arr = arr.filter((item) => item !== lite[limit.limit]);
                                const buttons = arr.map((perm) => ({
                                  label: `${perm} Membros`,
                                  value: perm.toString()
                                }));
                                const roww = new ActionRowBuilder().addComponents(
                                  new StringSelectMenuBuilder().setCustomId("ladylimit").setPlaceholder("Selecione uma opção").addOptions(buttons)
                                );
                                const embed = new ClientEmbed(interaction.user, server).setDescription(
                                  `Selecione o limite de membros que o cargo **${rolesexo.name}** pode ter, limite atual: **${lite[limit.limit]}**\n\n||Máximo de 15 membros.||`
                                );

                                const reply = await int.message.edit({
                                  embeds: [embed],
                                  components: [roww, row],
                                  content: null,
                                  fetchReply: true
                                });
                                collectorLimit1.stop();
                                const filter = (i) => i.message.id === reply.id;
                                const collectorLimit2 = interaction.channel.createMessageComponentCollector({
                                  filter: filter
                                });
                                collectorLimit2.on("collect", async (int) => {
                                  if (int.user.id == interaction.user.id) {
                                    if (int.customId == "ladylimit") {
                                      await int.values.forEach(async (v) => {
                                        await client.database.guilds.findOneAndUpdate(
                                          {
                                            idS: int.guild.id
                                          },
                                          {
                                            $pull: {
                                              "dama.perm": {
                                                id: rolesexo.id
                                              }
                                            }
                                          }
                                        );
                                        await client.database.guilds.findOneAndUpdate(
                                          {
                                            idS: int.guild.id
                                          },
                                          {
                                            $push: {
                                              "dama.perm": {
                                                id: rolesexo.id,
                                                limit: v
                                              }
                                            }
                                          }
                                        );
                                        const sv = await client.database.guilds.findOne({
                                          idS: interaction.guild.id
                                        });
                                        const row = new ActionRowBuilder().addComponents(
                                          new ButtonBuilder().setCustomId("editrole").setLabel("Adicionar Cargo").setStyle("Primary").setDisabled(false),
                                          new ButtonBuilder().setCustomId("limit").setLabel("Gerenciar Limite").setStyle("Secondary").setDisabled(false),
                                          new ButtonBuilder()
                                            .setCustomId("removerole")
                                            .setLabel("Remover Cargo")
                                            .setStyle("Danger")
                                            .setDisabled(sv.dama.perm.length == 0 ? true : false),
                                          new ButtonBuilder()
                                            .setCustomId("list")
                                            .setLabel("Listar Membros")
                                            .setStyle("Secondary")
                                            .setDisabled(sv.dama.lady === "null" ? true : false),
                                          new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                                        );
                                        let list = sv.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                                        const embedcargo = new ClientEmbed(interaction.user, server)
                                          .setAuthor({
                                            name: "Sistema de Primeira Dama",
                                            iconURL: client.user.displayAvatarURL({
                                              dynamic: true
                                            }),
                                            url: "https://discord.gg/squiford"
                                          })
                                          .setDescription("Aqui você pode configurar os cargo que possuem permissão para o sistema.\nReaja abaixo para configurar.")
                                          .addFields({
                                            name: "Cargos com Permissão",
                                            value: sv.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                                          });

                                        await int.message.edit({
                                          content: null,
                                          components: [row],
                                          embeds: [embedcargo],
                                          fetchReply: true
                                        });
                                        collectorLimit2.stop();
                                      });
                                    } else if (int.customId == "voltar") {
                                      const server = await client.database.guilds.findOne({
                                        idS: interaction.guild.id
                                      });
                                      const buttons = server.dama.perm.map((perm) => ({
                                        label: interaction.guild.roles.cache.find((r) => r.id === perm.id).name,
                                        description: `ID: ${perm.id}`,
                                        value: perm.id
                                      }));
                                      const roww = new ActionRowBuilder().addComponents(
                                        new StringSelectMenuBuilder().setCustomId("ladyremovercargo").setPlaceholder("Selecione uma opção").addOptions(buttons)
                                      );
                                      const row = new ActionRowBuilder().addComponents(
                                        new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                                      );
                                      const embed = new ClientEmbed(interaction.user, server).setDescription("Selecione o cargo que deseja alterar o limite de membros.");
                                      await int.message.edit({
                                        embeds: [embed],
                                        components: [roww, row],
                                        content: null,
                                        fetchReply: true
                                      });
                                      collectorLimit2.stop();
                                    }
                                  }
                                });
                              });
                            }
                          }
                        });
                      }
                      break;
                    case "removerole":
                      {
                        const server = await client.database.guilds.findOne({
                          idS: interaction.guild.id
                        });
                        const buttons = server.dama.perm.map((perm) => ({
                          label: interaction.guild.roles.cache.find((r) => r.id === perm.id).name,
                          description: `ID: ${perm.id}`,
                          value: perm.id
                        }));

                        const roww = new ActionRowBuilder().addComponents(
                          new StringSelectMenuBuilder()
                            .setCustomId("ladyremovercargo")
                            .setPlaceholder("Selecione uma opção")
                            .setMinValues(1)
                            .setMaxValues(buttons.size ? buttons.size : 1)
                            .addOptions(buttons)
                        );
                        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false));
                        const reply = await int.message.edit({
                          embeds: [],
                          components: [roww, row],
                          content: "Selecione o(s) cargo que deseja remover.",
                          fetchReply: true
                        });
                        const filter = (i) => i.message.id === reply.id;
                        const collector = interaction.channel.createMessageComponentCollector({
                          filter: filter
                        });
                        collector.on("collect", async (int) => {
                          if (int.user.id == interaction.user.id) {
                            if (int.customId == "ladyremovercargo") {
                              await int.values.forEach(async (v) => {
                                const newperm = await client.database.guilds.findOneAndUpdate(
                                  { idS: interaction.guild.id },
                                  {
                                    $pull: {
                                      "dama.perm": {
                                        id: v
                                      }
                                    }
                                  },
                                  { new: true }
                                );
                                const row = new ActionRowBuilder().addComponents(
                                  new ButtonBuilder().setCustomId("editrole").setLabel("Adicionar Cargo").setStyle("Primary").setDisabled(false),
                                  new ButtonBuilder().setCustomId("limit").setLabel("Gerenciar Limite").setStyle("Secondary").setDisabled(false),
                                  new ButtonBuilder()
                                    .setCustomId("removerole")
                                    .setLabel("Remover Cargo")
                                    .setStyle("Danger")
                                    .setDisabled(newperm.dama.perm.length == 0 ? true : false),
                                  new ButtonBuilder()
                                    .setCustomId("list")
                                    .setLabel("Listar Membros")
                                    .setStyle("Secondary")
                                    .setDisabled(newperm.dama.lady === "null" ? true : false),
                                  new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                                );
                                let list = newperm.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                                const embedcargo = new ClientEmbed(interaction.user, server)
                                  .setAuthor({
                                    name: "Sistema de Primeira Dama",
                                    iconURL: client.user.displayAvatarURL({
                                      dynamic: true
                                    }),
                                    url: "https://discord.gg/squiford"
                                  })
                                  .setDescription("Aqui você pode configurar os cargo que possuem permissão para o sistema.\nReaja abaixo para configurar.")
                                  .addFields({
                                    name: "Cargos com Permissão",
                                    value: newperm.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                                  });
                                collector.stop();
                                int.message.edit({
                                  content: null,
                                  components: [row],
                                  embeds: [embedcargo],
                                  fetchReply: true
                                });
                              });
                            } else if (int.customId == "voltar") {
                              const sexy = await client.database.guilds.findOne({ idS: interaction.guild.id });
                              const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId("editrole").setLabel("Adicionar Cargo").setStyle("Primary").setDisabled(false),
                                new ButtonBuilder().setCustomId("limit").setLabel("Gerenciar Limite").setStyle("Secondary").setDisabled(false),
                                new ButtonBuilder()
                                  .setCustomId("removerole")
                                  .setLabel("Remover Cargo")
                                  .setStyle("Danger")
                                  .setDisabled(sexy.dama.perm.length == 0 ? true : false),
                                new ButtonBuilder()
                                  .setCustomId("list")
                                  .setLabel("Listar Membros")
                                  .setStyle("Secondary")
                                  .setDisabled(sexy.dama.lady === "null" ? true : false),
                                new ButtonBuilder().setCustomId("voltar").setLabel("Voltar").setStyle("Secondary").setDisabled(false)
                              );
                              let list = sexy.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                              const embedcargo = new ClientEmbed(interaction.user, server)
                                .setAuthor({
                                  name: "Sistema de Primeira Dama",
                                  iconURL: client.user.displayAvatarURL({
                                    dynamic: true
                                  }),
                                  url: "https://discord.gg/squiford"
                                })
                                .setDescription("Aqui você pode configurar os cargo que possuem permissão para o sistema.\nReaja abaixo para configurar.")
                                .addFields({
                                  name: "Cargos com Permissão",
                                  value: sexy.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                                });
                              collector.stop();
                              int.message.edit({
                                content: null,
                                components: [row],
                                embeds: [embedcargo],
                                fetchReply: true
                              });
                            }
                          }
                        });
                      }
                      break;
                    case "list":
                      {
                        const server = await client.database.guilds.findOne({
                          idS: interaction.guild.id
                        });
                        const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, vou fazer quando tiver pronto o restante, esse é chato`);
                        int.followUp({
                          content: null,
                          embeds: [embed],
                          ephemeral: true
                        });
                      }
                      break;
                    case "voltar":
                      {
                        const server = await client.database.guilds.findOne({
                          idS: interaction.guild.id
                        });
                        let list = server.dama.perm.map((r) => ` <@&${r.id}> **Limite:** ${lite[r.limit]}`).join("\n");
                        const embedprincipal = new ClientEmbed(interaction.user, server)
                          .setAuthor({
                            name: "Sistema de Primeira Dama",
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true
                            }),
                            url: "https://discord.gg/squiford"
                          })
                          .setDescription("Aqui você pode configurar o sistema de Primeira Dama.\nReaja abaixo para configurar.")
                          .addFields(
                            {
                              name: "Cargo de Primeira Dama",
                              value: server.dama.lady === "null" ? "Nenhum cargo configurado." : `<@&${server.dama.lady}>`
                            },
                            {
                              name: "Cargos com permissão para o sistema",
                              value: server.dama.perm.toString() == "" ? "Nenhum cargo configurado." : list
                            }
                          );
                        int.message.edit({
                          content: null,
                          embeds: [embedprincipal],
                          components: [rowprincipal],
                          fetchReply: true
                        });
                        collectorPermPrincipal.stop();
                      }
                      break;
                  }
                }
              });
            }
          }
        }
      });
    }
    if (toggle === "member") {
      const server = await client.database.guilds.findOne({
        idS: interaction.guild.id
      });
      if (!interaction.member.roles.cache.some((role) => server.dama.perm.find(({ id }) => id.includes(role.id)))) {
        return interaction.reply({
          content: `${interaction.user}, você não tem permissão para executar esse comando.`,
          ephemeral: true
        });
      }
      if (server.dama.lady === "null") {
        return interaction.reply({
          content: `${interaction.user}, o cargo de Primeira Dama não foi configurado.`,
          ephemeral: true
        });
      }
      let userDB = await client.database.guilduser.findOne({
        idU: interaction.user.id,
        idS: interaction.guild.id
      });
      if (!userDB) {
        userDB = await client.database.guilduser.create({
          idU: interaction.user.id,
          idS: interaction.guild.id
        });
      }
      if (!userDB.lady.dama) {
        limiteUser = 0;
      } else {
        limiteUser = userDB.lady.dama.length;
      }
      const damaRoles = interaction.member.roles.cache
        .filter((r) => server.dama.perm.some((p) => p.id === r.id))
        .map((role) => ({
          ...server.dama.perm.find((p) => p.id === role.id),
          role
        }));
      const highestLimit = damaRoles.sort((a, b) => b.limit - a.limit)[0];
      const limite = highestLimit.limit;
      const rowprincipal = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("addlady")
          .setLabel("Adicionar Dama")
          .setStyle("Primary")
          .setDisabled(limiteUser >= limite ? true : false),
        new ButtonBuilder()
          .setCustomId("removelady")
          .setLabel("Remover Dama")
          .setStyle("Danger")
          .setDisabled(limiteUser == 0 ? true : false)
      );
      const arr = userDB.lady.dama.map((x) => x);
      const filteredArr = arr.filter(function (item, index) {
        if (arr.findIndex((i) => i.user === item.user) == index) return item;
      });
      const embedprincipal = new ClientEmbed(interaction.user, server)
        .setAuthor({
          name: "Sistema de Primeira Dama",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          url: "https://discord.gg/squiford"
        })
        .setDescription(
          `**[Clique aqui para ver um tutorial.](https://www.youtube.com/watch?v=sO3xrxbcaTM)**\n> **Permissão Concedia Por**:\n<@&${highestLimit.role.id}> | Limite: ${highestLimit.limit
          }\n\n${limiteUser === 0
            ? "Nenhuma Dama"
            : filteredArr.map((r) => `👍 <@${r.user}> | ${time(Math.round(r.time / 1000), "R")}`).join("\n")
          }`
        );
      const reply = await interaction.reply({
        content: null,
        embeds: [embedprincipal],
        components: [rowprincipal],
        fetchReply: true
      });
      const filter = (i) => i.isButton() && i.message.id === reply.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter: filter
      });
      collector.on("collect", async (int) => {
        if (int.user.id !== interaction.user.id) {
          int.update({});
        }
        if (int.user.id == interaction.user.id) {
          await int.update({});
          switch (int.customId) {
            case "addlady":
              {
                const server = await client.database.guilds.findOne({
                  idS: interaction.guild.id
                });
                const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, mencione o membro que você deseja adicionar como Primeira Dama.`);
                await int.followUp({
                  content: null,
                  embeds: [embed],
                  ephemeral: true
                });
                const filter = (m) => m.author.id === interaction.user.id;
                const collectPerm = interaction.channel.createMessageCollector({
                  max: 1,
                  filter: filter
                });
                collectPerm.on("collect", async (m) => {
                  m.delete();
                  const user = m.mentions.members.first() || m.guild.members.cache.get(m.content);
                  if (!user) {
                    const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, você não mencionou um membro válido.`);
                    await int.message.edit({
                      content: null,
                      embeds: [embed],
                      ephemeral: true
                    });
                  } else {
                    let usermention = await client.database.guilduser.findOne({
                      idU: user.id,
                      idS: interaction.guild.id
                    });
                    if (!usermention) {
                      usermention = await client.database.guilduser.create({
                        idU: user.id,
                        idS: interaction.guild.id
                      });
                    }
                    if (usermention.lady.recebeu.status) {
                      const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, este membro já recebeu o primeira dama de outra pessoa.`);
                      await int.followUp({
                        content: null,
                        embeds: [embed],
                        ephemeral: true
                      });
                    } else {
                      collectPerm.stop();
                      if (user) {
                        const role = m.guild.roles.cache.get(server.dama.lady);
                        if (role.editable) {
                          user.roles.add(role);
                        } else {
                          const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, não consegui adicionar o cargo de primeira dama, somente no banco de dados, peça para que adicionem manualmente ou que subam meu cargo acima dos demais..`);
                          await int.followUp({
                            content: null,
                            embeds: [embed],
                            ephemeral: true
                          });
                        }
                        const userDB = await client.database.guilduser.findOneAndUpdate(
                          {
                            idS: interaction.guild.id,
                            idU: interaction.user.id
                          },
                          {
                            $push: {
                              "lady.dama": {
                                user: user.id,
                                time: Date.now(),
                                has: true
                              }
                            }
                          },
                          { new: true }
                        );
                        await client.database.guilduser.findOneAndUpdate(
                          { idS: interaction.guild.id, idU: user.id },
                          {
                            $set: {
                              "lady.recebeu.user": interaction.user.id,
                              "lady.recebeu.status": true
                            }
                          },
                          { new: true }
                        );
                        const limiteUser = userDB.lady.dama.length;
                        const damaRoles = interaction.member.roles.cache
                          .filter((r) => server.dama.perm.some((p) => p.id === r.id))
                          .map((role) => ({
                            ...server.dama.perm.find((p) => p.id === role.id),
                            role
                          }));
                        const highestLimit = damaRoles.sort((a, b) => b.limit - a.limit)[0];
                        const limite = highestLimit.limit;
                        const rowprincipal = new ActionRowBuilder().addComponents(
                          new ButtonBuilder()
                            .setCustomId("addlady")
                            .setLabel("Adicionar Dama")
                            .setStyle("Primary")
                            .setDisabled(limiteUser >= limite ? true : false),
                          new ButtonBuilder()
                            .setCustomId("removelady")
                            .setLabel("Remover Dama")
                            .setStyle("Danger")
                            .setDisabled(limiteUser == 0 ? true : false)
                        );
                        const arr = userDB.lady.dama.map((x) => x);
                        const filteredArr = arr.filter(function (item, index) {
                          if (arr.findIndex((i) => i.user === item.user) == index) return item;
                        });
                        const embedprincipal = new ClientEmbed(interaction.user, server)
                          .setAuthor({
                            name: "Sistema de Primeira Dama",
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true
                            }),
                            url: "https://discord.gg/squiford"
                          })
                          .setDescription(
                            `> **Permissão Concedia Por**:\n<@&${highestLimit.role.id}> | Limite: ${highestLimit.limit}\n\n${filteredArr
                              .map((r) => `👍 <@${r.user}> | ${time(Math.round(r.time / 1000), "R")}`)
                              .join("\n")}`
                          );
                        await int.message.edit({
                          content: null,
                          embeds: [embedprincipal],
                          components: [rowprincipal],
                          fetchReply: true
                        });
                      }
                    }
                  }
                });
              }
              break;
            case "removelady":
              {
                const server = await client.database.guilds.findOne({
                  idS: interaction.guild.id
                });
                const userDB = await client.database.guilduser.findOne({
                  idU: interaction.user.id,
                  idS: interaction.guild.id
                });
                const arr = userDB.lady.dama.map((x) => x);
                const filteredArr = arr.filter(function (item, index) {
                  if (arr.findIndex((i) => i.user === item.user) == index) return item;
                });
                const buttons = await Promise.all(
                  await filteredArr.map(async (perm) => ({
                    label: await client.users.fetch(perm.user).then((user) => user.tag),
                    description: `ID: ${perm.user}`,
                    value: perm.user
                  }))
                );
                const roww = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("ladyremover").setPlaceholder("Escolha uma opção").addOptions(buttons));
                const embed = new ClientEmbed(interaction.user, server)
                  .setAuthor({
                    name: "Sistema de Primeira Dama",
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    url: "https://discord.gg/squiford"
                  })
                  .setDescription(`> **Selecione o membro que você deseja remover como Primeira Dama.**`);
                const reply = await int.message.edit({
                  embeds: [embed],
                  components: [roww],
                  content: null,
                  fetchReply: true
                });
                const filter = (i) => i.message.id === reply.id;
                const collectorkk = interaction.channel.createMessageComponentCollector({
                  filter: filter
                });
                collectorkk.on("collect", async (int) => {
                  if (int.user.id !== interaction.user.id) {
                    await int.reply({
                      content: "Você não pode user isto.",
                      ephemeral: true
                    });
                  }
                  if (int.user.id == interaction.user.id) {
                    if (int.customId == "ladyremover") {
                      await int.values.forEach(async (v) => {
                        const user = await int.guild.members.fetch(v);
                        const role = int.guild.roles.cache.get(server.dama.lady);
                        await client.database.guilduser.findOneAndUpdate(
                          { idS: interaction.guild.id, idU: user.id },
                          {
                            $set: {
                              "lady.recebeu.user": "null",
                              "lady.recebeu.status": false
                            }
                          }
                        );
                        const userDB = await client.database.guilduser.findOneAndUpdate(
                          {
                            idS: interaction.guild.id,
                            idU: interaction.user.id
                          },
                          {
                            $pull: {
                              "lady.dama": {
                                user: user.id
                              }
                            }
                          },
                          { new: true }
                        );
                        if (role.editable) {
                          user.roles.remove(role)
                          const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, você removeu o Primeira Dama de ${user} com sucesso.`);
                          await int.reply({
                            content: null,
                            embeds: [embed],
                            ephemeral: true
                          });
                        } else {
                          const embed = new ClientEmbed(interaction.user, server).setDescription(`${int.user}, você removeu o Primeira Dama de ${user} com sucesso.\n**Porém não conseguir remover o cargo do usuario, somente do banco de dados.`);
                          await int.reply({
                            content: null,
                            embeds: [embed],
                            ephemeral: true
                          });
                        }
                        const limiteUser = userDB.lady.dama.length;
                        const damaRoles = interaction.member.roles.cache
                          .filter((r) => server.dama.perm.some((p) => p.id === r.id))
                          .map((role) => ({
                            ...server.dama.perm.find((p) => p.id === role.id),
                            role
                          }));
                        const highestLimit = damaRoles.sort((a, b) => b.limit - a.limit)[0];
                        const limite = highestLimit.limit;
                        const rowprincipal = new ActionRowBuilder().addComponents(
                          new ButtonBuilder()
                            .setCustomId("addlady")
                            .setLabel("Adicionar Dama")
                            .setStyle("Primary")
                            .setDisabled(limiteUser >= limite ? true : false),
                          new ButtonBuilder()
                            .setCustomId("removelady")
                            .setLabel("Remover Dama")
                            .setStyle("Danger")
                            .setDisabled(limiteUser == 0 ? true : false)
                        );
                        const arr = userDB.lady.dama.map((x) => x);
                        const filteredArr = arr.filter(function (item, index) {
                          if (arr.findIndex((i) => i.user === item.user) == index) return item;
                        });
                        const embedprincipal = new ClientEmbed(interaction.user, server)
                          .setAuthor({
                            name: "Sistema de Primeira Dama",
                            iconURL: client.user.displayAvatarURL({
                              dynamic: true
                            }),
                            url: "https://discord.gg/squiford"
                          })
                          .setDescription(
                            `> **Permissão Concedia Por**:\n<@&${highestLimit.role.id}> | Limite: ${highestLimit.limit}\n\n${filteredArr
                              .map((r) => `👍 <@${r.user}> | ${time(Math.round(r.time / 1000), "R")}`)
                              .join("\n")}`
                          );
                        await int.message.edit({
                          content: null,
                          embeds: [embedprincipal],
                          components: [rowprincipal],
                          fetchReply: true
                        });
                        collectorkk.stop();
                      });
                    }
                  }
                });
              }
              break;
          }
        }
      });
    }
  }
};
