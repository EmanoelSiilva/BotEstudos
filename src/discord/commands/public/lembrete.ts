import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { scheduleJob } from "node-schedule";

const reminders = [];

new Command({
    name: "criar_lembrete",
    description: "Cria um lembrete para uma tarefa ou evento futuro.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tarefa",
            description: "Descrição da tarefa ou evento",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "data",
            description: "Data e hora do lembrete (YYYY-MM-DD HH:MM)",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run(interaction) {
        const tarefa = interaction.options.getString("tarefa");
        const dataStr = interaction.options.getString("data");

        if (!dataStr) {
            return interaction.reply({ content: "Você deve fornecer uma data.", ephemeral: true });
        }

        const data = new Date(dataStr);
        if (isNaN(data.getTime())) {
            return interaction.reply({ content: "Data inválida. Por favor, use o formato YYYY-MM-DD HH:MM", ephemeral: true });
        }

        if (data < new Date()) {
            return interaction.reply({ content: "A data deve estar no futuro.", ephemeral: true });
        }

        reminders.push({ tarefa, data, userId: interaction.user.id });

        scheduleJob(data, () => {
            const user = interaction.client.users.cache.get(interaction.user.id);
            if (user) {
                user.send(`Lembrete: ${tarefa}`);
            }
        });

        const embed = createEmbed({
            color: "#00FF00",
            description: `Lembrete criado com sucesso! Você será lembrado de "${tarefa}" em ${data.toLocaleString()}.`
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});
