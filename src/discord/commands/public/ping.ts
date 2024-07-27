import { Command } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

new Command({
	name: "ping",
	description: "Teste de ping",
	dmPermission: false,
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const Author = interaction.user;
		const ping = interaction.client.ws.ping;

		const embed = createEmbed({
			color: settings.colors.magic,
			description: `Salve meu mano ${Author.username}! Tá aqui seu teste de ping \`loading...\``
		});

		await interaction.reply({ embeds: [embed], ephemeral }).then(() => {
			const embed02 = createEmbed({
				color: settings.colors.azoxo,
				description: `Salve meu mano ${Author.username}! Tá aqui seu teste de ping \`${ping}\``
			});

			interaction.editReply({ embeds: [embed02] });
		});
	}
})