import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { settings } from "#settings";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";

const flashcards = new Map();

new Command ({
    name: "flashcards",
    description: "Gerencie seus flashcards.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "criar",
            description: "Crie um novo flashcard",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "pergunta",
                    description: "Pergunta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "resposta",
                    description: "Resposta do flashcard",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
    async run (interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "criar") {
            const pergunta = interaction.options.getString("pergunta");
            const resposta = interaction.options.getString("resposta");
            const userId = interaction.user.id;

            if (!flashcards.has(userId)) {
                flashcards.set(userId, []);
            }

            flashcards.get(userId).push({ question: pergunta, answer: resposta });

            const embed = createEmbed({
                color: settings.colors.developer,
                description: `Flashcard criado com sucesso! \n**Pergunta:** ${pergunta} \n**Resposta** ${resposta}`
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
});