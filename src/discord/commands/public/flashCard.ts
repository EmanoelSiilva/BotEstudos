import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

// Simulação de armazenamento de flashcards (substitua por um banco de dados em produção)
const flashcards = new Map();  // userId -> [{question, answer}]

new Command({
    name: "flashcards",
    description: "Gerencia seus flashcards.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "criar",
            description: "Cria um novo flashcard.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pergunta",
                    description: "A pergunta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "resposta",
                    description: "A resposta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "editar",
            description: "Edita um flashcard existente.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "index",
                    description: "O índice do flashcard a ser editado (começando de 0)",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: "nova_pergunta",
                    description: "A nova pergunta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "nova_resposta",
                    description: "A nova resposta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name: "revisar",
            description: "Revisa seus flashcards.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "listar",
            description: "Lista todos os seus flashcards.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "excluir",
            description: "Exclui um flashcard existente.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "index",
                    description: "O índice do flashcard a ser excluído (começando de 0)",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }
    ],
    async run(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommand === "criar") {
            const pergunta = interaction.options.getString("pergunta");
            const resposta = interaction.options.getString("resposta");

            if (!flashcards.has(userId)) {
                flashcards.set(userId, []);
            }

            flashcards.get(userId).push({ question: pergunta, answer: resposta });

            const embed = createEmbed({
                color: "#00FF00",
                description: `Flashcard criado com sucesso!\n**Pergunta:** ${pergunta}\n**Resposta:** ${resposta}`
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === "editar") {
            const index = interaction.options.getInteger("index");
            const novaPergunta = interaction.options.getString("nova_pergunta");
            const novaResposta = interaction.options.getString("nova_resposta");

            if (index === null || !flashcards.has(userId) || index >= flashcards.get(userId).length) {
                return interaction.reply({ content: "Flashcard não encontrado!", ephemeral: true });
            }

            const flashcard = flashcards.get(userId)[index];
            if (novaPergunta) flashcard.question = novaPergunta;
            if (novaResposta) flashcard.answer = novaResposta;

            const embed = createEmbed({
                color: "#00FF00",
                description: `Flashcard editado com sucesso!\n**Pergunta:** ${flashcard.question}\n**Resposta:** ${flashcard.answer}`
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === "revisar") {
            if (!flashcards.has(userId) || flashcards.get(userId).length === 0) {
                return interaction.reply({ content: "Você não tem flashcards para revisar.", ephemeral: true });
            }

            const userFlashcards = flashcards.get(userId);
            let currentIndex = 0;

            const showFlashcard = async (index: number) => {
                const flashcard = userFlashcards[index];
                const embed = createEmbed({
                    color: "#FFFF00",
                    description: `**Pergunta:** ${flashcard.question}`
                });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("showAnswer")
                            .setLabel("Mostrar Resposta")
                            .setStyle(ButtonStyle.Primary)
                    );

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            };

            const handleAnswer = async (index: number) => {
                const flashcard = userFlashcards[index];
                const embed = createEmbed({
                    color: "#00FF00",
                    description: `**Pergunta:** ${flashcard.question}\n**Resposta:** ${flashcard.answer}`
                });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("errei")
                            .setLabel("Errei")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId("dificil")
                            .setLabel("Difícil")
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("bom")
                            .setLabel("Bom")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId("facil")
                            .setLabel("Fácil")
                            .setStyle(ButtonStyle.Success)
                    );

                await interaction.editReply({ embeds: [embed], components: [row] });
            };

            if (interaction.channel) {
                const collector = interaction.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000 // 1 minuto
                });

                collector.on("collect", async (buttonInteraction) => {
                    if (buttonInteraction.user.id !== interaction.user.id) {
                        return buttonInteraction.reply({ content: "Você não pode interagir com este flashcard.", ephemeral: true });
                    }

                    if (buttonInteraction.customId === "showAnswer") {
                        await handleAnswer(currentIndex);
                    } else {
                        currentIndex++;
                        if (currentIndex < userFlashcards.length) {
                            await showFlashcard(currentIndex);
                        } else {
                            await buttonInteraction.reply({ content: "Você revisou todos os seus flashcards!", ephemeral: true });
                            collector.stop();
                        }
                    }

                    await buttonInteraction.deferUpdate();

                    return ;
                });

                collector.on("end", collected => {
                    console.log(`Coletado ${collected.size} interações.`);
                });

                await showFlashcard(currentIndex);

            } else {
                await interaction.reply({ content: "Erro ao acessar o canal para coletar interações.", ephemeral: true });
            }
        } else if (subcommand === "listar") {
            if (!flashcards.has(userId) || flashcards.get(userId).length === 0) {
                return interaction.reply({ content: "Você não tem flashcards.", ephemeral: true });
            }

            const userFlashcards = flashcards.get(userId);
            const description = userFlashcards.map((fc: { question: string, answer: string }, index: number) => `**${index}:** ${fc.question} -> ${fc.answer}`).join("\n");

            const embed = createEmbed({
                color: "#00FF00",
                description: `Seus flashcards:\n${description}`
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === "excluir") {
            const index = interaction.options.getInteger("index");

            if (index === null || !flashcards.has(userId) || index >= flashcards.get(userId).length) {
                return interaction.reply({ content: "Flashcard não encontrado!", ephemeral: true });
            }

            flashcards.get(userId).splice(index, 1);

            const embed = createEmbed({
                color: "#FF0000",
                description: "Flashcard excluído com sucesso!"
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        return;
    }
});
