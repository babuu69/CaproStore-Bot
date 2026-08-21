import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getColor } from '../../config/bot.js';
import { withErrorHandling } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName('restock')
        .setDescription('Post a styled stock/restock announcement')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('product')
                .setDescription('Product name')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantity')
                .setDescription('How many were restocked')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100000)
        )
        .addNumberOption(option =>
            option
                .setName('price')
                .setDescription('Price per item')
                .setRequired(true)
                .setMinValue(0)
        )
        .addStringOption(option =>
            option
                .setName('access')
                .setDescription('Access type')
                .setRequired(false)
                .addChoices(
                    { name: 'Non-Full Access', value: 'Non-Full Access' },
                    { name: 'Full Access', value: 'Full Access' }
                )
        )
        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('Product status')
                .setRequired(false)
                .addChoices(
                    { name: 'Unbanned', value: 'Unbanned' },
                    { name: 'Banned', value: 'Banned' }
                )
        )
        .addStringOption(option =>
            option
                .setName('warranty')
                .setDescription('Warranty period')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('format')
                .setDescription('Display format (keep credentials out of the public embed)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('channel')
                .setDescription('Channel ID to post in (leave empty for this channel)')
                .setRequired(false)
        ),

    category: 'Economy',

    execute: withErrorHandling(async (interaction) => {
        const product = interaction.options.getString('product');
        const quantity = interaction.options.getInteger('quantity');
        const price = interaction.options.getNumber('price');
        const access = interaction.options.getString('access') || 'Non-Full Access';
        const status = interaction.options.getString('status') || 'Unbanned';
        const warranty = interaction.options.getString('warranty') || '12-hour warranty';
        const format = interaction.options.getString('format') || 'username:<private credential>';
        const channelId = interaction.options.getString('channel');

        let channel = interaction.channel;
        if (channelId) {
            channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
        }

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ I could not find a usable text channel.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setTitle(`✨ RESTOCKED — ${quantity}x ${product}`)
            .setDescription([
                `❌ **${access}**`,
                `✅ **${status}**`,
                `⏱️ **${warranty}**`,
                '⚡ **Instant delivery**',
            ].join('\n'))
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━',
                    value: `📦 **STOCK**\n**${quantity} available**`,
                    inline: false,
                },
                {
                    name: '💰 PRICE',
                    value: `**$${price.toFixed(2)} each**`,
                    inline: true,
                },
                {
                    name: '🟢 STATUS',
                    value: '**Available now**',
                    inline: true,
                },
                {
                    name: '🔐 FORMAT',
                    value: `\`${format}\``,
                    inline: false,
                },
            )
            .setFooter({ text: 'CaproStore • Stock announcement' })
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        if (channel.id === interaction.channelId) {
            await interaction.reply({
                content: `✅ Posted the **${quantity}x ${product}** restock embed.`,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: `✅ Posted the **${quantity}x ${product}** restock embed in <#${channel.id}>.`,
                ephemeral: true,
            });
        }
    }),
};
