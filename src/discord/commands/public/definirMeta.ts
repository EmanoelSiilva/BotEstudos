import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { addUserGoal } from "database/MetaDb.js";

const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
};

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
            description: "Data de início da meta (DD-MM-YYYY)",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "data_término",
            description: "Data de término da meta (DD-MM-YYYY)",
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

        const dataInício: Date = parseDate(dataInícioStr);
        const dataTérmino: Date = parseDate(dataTérminoStr);

        if (isNaN(dataInício.getTime()) || isNaN(dataTérmino.getTime())) {
            return interaction.reply({ content: "Data inválida. Por favor, use o formato DD-MM-YYYY.", ephemeral: true });
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
            description: `Meta criada com sucesso!\n**Descrição:** ${descrição}\n**Data de Início:** ${dataInício.toLocaleDateString("pt-BR")}\n**Data de Término:** ${dataTérmino.toLocaleDateString("pt-BR")}\n**Frequência:** ${frequência}`
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});