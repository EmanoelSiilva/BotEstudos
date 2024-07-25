import { Command } from "#base";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

// Lista de comandos e suas descrições
const commands = [
    { name: "/ajuda", description: "Exibe uma lista de todos os comandos disponíveis e como usá-los." },
    { name: "/criar_lembrete", description: "Cria um lembrete para uma tarefa ou evento futuro." },
    { name: "/flashcards", description: "Permite criar, editar e testar flashcards." },
    { name: "/definir_meta", description: "Define uma meta de estudo diária ou semanal." },
    { name: "/resumo", description: "Gera um resumo de um texto fornecido." },
    { name: "/cronometro", description: "Inicia um cronômetro para sessões de estudo focado." },
    { name: "/quiz", description: "Inicia um quiz sobre um tópico específico." },
    { name: "/anotacao", description: "Permite criar, editar e exibir anotações de estudo." },
    { name: "/dica_estudo", description: "Exibe dicas de estudo e técnicas de aprendizagem." },
    { name: "/revisao", description: "Programa revisões periódicas dos conteúdos estudados." },
    { name: "/motivacao", description: "Envia mensagens motivacionais para encorajar os estudos." },
    { name: "/progresso", description: "Exibe o progresso de estudo do usuário." }
];

new Command({
    name: "ajuda",
    description: "Exibe uma lista de todos os comandos disponíveis e como usá-los.",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const embed = createEmbed({
            color: "#00FF00",  // Escolha uma cor apropriada para o embed
            title: "Lista de Comandos",
            description: commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join("\n")
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});
