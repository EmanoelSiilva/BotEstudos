import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType, ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { addUserGoal, getUserGoals, updateUserGoal, deleteUserGoal } from "database/MetaDb.js";

const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
};

new Command({
    name: "meta",
    description: "Gerencie suas metas de estudo.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "definir",
            description: "Defina uma nova meta de estudo.",
            type: ApplicationCommandOptionType.Subcommand,
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
            ]
        },
        {
            name: "listar",
            description: "Liste suas metas de estudo.",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "editar",
            description: "Edite uma meta de estudo existente.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "índice",
                    description: "Índice da meta a ser editada",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: "descrição",
                    description: "Nova descrição da meta de estudo",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "data_início",
                    description: "Nova data de início da meta (DD-MM-YYYY)",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "data_término",
                    description: "Nova data de término da meta (DD-MM-YYYY)",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "frequência",
                    description: "Nova frequência da meta (diária, semanal, etc.)",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name: "excluir",
            description: "Exclua uma meta de estudo existente.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "índice",
                    description: "Índice da meta a ser excluída",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
        }
    ],
    async run(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (subcommand === "definir") {
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

            await addUserGoal(userId, goal);

            const embed = createEmbed({
                color: "#00FF00",
                description: `Meta criada com sucesso!\n**Descrição:** ${descrição}\n**Data de Início:** ${dataInício.toLocaleDateString("pt-BR")}\n**Data de Término:** ${dataTérmino.toLocaleDateString("pt-BR")}\n**Frequência:** ${frequência}`
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === "listar") {
            const goals = await getUserGoals(userId);
            if (goals.length === 0) {
                return interaction.reply({ content: "Você não tem metas definidas.", ephemeral: true });
            }

            const goalList = goals.map((goal, index) => 
                `**${index}:** ${goal.description} (Início: ${goal.startDate.toLocaleDateString("pt-BR")}, Término: ${goal.endDate.toLocaleDateString("pt-BR")}, Frequência: ${goal.frequency})`
            ).join("\n");

            const embed = createEmbed({
                color: "#00FF00",
                description: `Suas metas:\n\n${goalList}`
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === "editar") {
            const index: number = interaction.options.getInteger("índice")!;
            const descrição: string | null = interaction.options.getString("descrição");
            const dataInícioStr: string | null = interaction.options.getString("data_início");
            const dataTérminoStr: string | null = interaction.options.getString("data_término");
            const frequência: string | null = interaction.options.getString("frequência");

            const goals = await getUserGoals(userId);

            if (index < 0 || index >= goals.length) {
                return interaction.reply({ content: "Índice inválido. Por favor, forneça um índice válido.", ephemeral: true });
            }

            if (descrição) goals[index].description = descrição;
            if (dataInícioStr) {
                const dataInício = parseDate(dataInícioStr);
                if (isNaN(dataInício.getTime())) {
                    return interaction.reply({ content: "Data de início inválida. Por favor, use o formato DD-MM-YYYY.", ephemeral: true });
                }
                goals[index].startDate = dataInício;
            }
            if (dataTérminoStr) {
                const dataTérmino = parseDate(dataTérminoStr);
                if (isNaN(dataTérmino.getTime())) {
                    return interaction.reply({ content: "Data de término inválida. Por favor, use o formato DD-MM-YYYY.", ephemeral: true });
                }
                goals[index].endDate = dataTérmino;
            }
            if (frequência) goals[index].frequency = frequência;

            await updateUserGoal(userId, index, goals[index]);

            return interaction.reply({ content: "Meta atualizada com sucesso!", ephemeral: true });

        } else if (subcommand === "excluir") {
            const index: number = interaction.options.getInteger("índice")!;
            const goals = await getUserGoals(userId);

            if (index < 0 || index >= goals.length) {
                return interaction.reply({ content: "Índice inválido. Por favor, forneça um índice válido.", ephemeral: true });
            }

            await deleteUserGoal(userId, index);

            return interaction.reply({ content: "Meta excluída com sucesso!", ephemeral: true });
        }
    }
});