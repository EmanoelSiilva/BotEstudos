import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { addUserGoal } from "database/MetaDb.js";

new Command({
    name: "definir_meta",
    description: "Defina uma nova meta de estudo.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "descrição",
            description: "Descrição da meta de estudo",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "data_início",
            description: "Data de início da meta (YYYY-MM-DD)",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "data_término",
            description: "Data de término da meta (YYYY-MM-DD)",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "frequência",
            description: "Frequência da meta (diária, semanal, etc.)",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async run(interaction: ChatInputCommandInteraction) {
        const descrição: string = interaction.options.getString("descrição") ?? "";
        const dataInícioStr: string = interaction.options.getString("data_início") ?? "";
        const dataTérminoStr: string = interaction.options.getString("data_término") ?? "";
        const frequência: string = interaction.options.getString("frequência") ?? "";

        const dataInício: Date = new Date(dataInícioStr);
        const dataTérmino: Date = new Date(dataTérminoStr);

        if (isNaN(dataInício.getTime()) || isNaN(dataTérmino.getTime())) {
            return interaction.reply({ content: "Data inválida. Por favor, use o formato YYYY-MM-DD.", ephemeral: true });
        }

        if (dataInício >= dataTérmino) {
            return interaction.reply({ content: "A data de início deve ser anterior à data de término.", ephemeral: true });
        }

        const goal = {
            description: descrição,
            startDate: dataInício,
            endDate: dataTérmino,
            frequency: frequência
        };

        await addUserGoal(interaction.user.id, goal);

        const embed = createEmbed({
            color: "#00FF00",
            description: `Meta criada com sucesso!\n**Descrição:** ${descrição}\n**Data de Início:** ${dataInício.toLocaleDateString()}\n**Data de Término:** ${dataTérmino.toLocaleDateString()}\n**Frequência:** ${frequência}`
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});