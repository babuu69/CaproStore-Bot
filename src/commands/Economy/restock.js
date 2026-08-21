import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import { getColor } from '../../config/bot.js';
import { withErrorHandling } from '../../utils/errorHandler.js';

// Replace the IDs below with your server's custom emoji IDs.
// Example: <:restock:123456789012345678>
const EMOJIS = {
    verify: '<a:verify:1539966415468101632>',
    nfa: '<:bluedot:1539966417338769409>',
    mfa: '<:bluedot:1539966417338769409>',
    unbanned: '<:ticktyfy:1539966407029297193>',
    banned: '<:x_:1540383734828892291>',
    timer: '<:timer:1540381779960266784>',
    instant: '<:ticks:1540381783613513788>',
    stock: '<:star:1540381763099168789>',
    price: '<:arrow:1540381810729558076>',
    status: '<:ticks:1540381783613513788>',
};

const BUY_CHANNEL_URL = 'https://discord.com/channels/1494762739615137842/1494762742740029762';

export default {
    data: new SlashCommandBuilder()
        .setName('restock')
        .setDescription('Post a styled stock/restock announcement')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('product').setDescription('Product name').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('quantity').setDescription('How many were restocked').setRequired(true).setMinValue(1).setMaxValue(100000)
        )
        .addStringOption(option =>
            option.setName('price').setDescription('Custom price, e.g. $5 or $4.99 each').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('access').setDescription('Access type').setRequired(false).addChoices(
                { name: '<:bluedot:1539966417338769409> NFA', value: 'NFA' },
                { name: '<:bluedot:1539966417338769409> MFA', value: 'MFA' },
            )
        )
        .addStringOption(option =>
            option.setName('status').setDescription('Product status').setRequired(false).addChoices(
                { name: '<:ticktyfy:1539966407029297193> Unbanned', value: 'Unbanned' },
                { name: '<:x_:1540383734828892291> Banned', value: 'Banned' },
            )
        )
        .addStringOption(option =>
            option.setName('time').setDescription('Warranty/time period, e.g. 12-hour').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('format').setDescription('Display format').setRequired(false)
        )
        .addStringOption(option =>
            option.setName('channel').setDescription('Channel ID to post in (leave empty for this channel)').setRequired(false)
        ),

    category: 'Economy',

    execute: withErrorHandling(async (interaction) => {
        const product = interaction.options.getString('product');
        const quantity = interaction.options.getInteger('quantity');
        const price = interaction.options.getString('price');
        const access = interaction.options.getString('access') || 'NFA';
        const status = interaction.options.getString('status') || 'Unbanned';
        const time = interaction.options.getString('time') || '12-hour';
        const format = interaction.options.getString('format') || 'username:refreshToken';
        const channelId = interaction.options.getString('channel');

        const accessDisplay = access === 'MFA'
            ? `${EMOJIS.nfa} **MFA**`
            : `${EMOJIS.nfa} **NFA**`;

        const statusDisplay = status === 'Unbanned'
            ? `${EMOJIS.unbanned} **Unbanned**`
            : `${EMOJIS.banned} **Banned**`;

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
            .setTitle(`${EMOJIS.verify} RESTOCKED — ${quantity}x ${product}`)
            .setDescription([
                accessDisplay,
                statusDisplay,
                `${EMOJIS.timer} **${time}**`,
                `${EMOJIS.instant} **Instant delivery**`,
            ].join('\n'))
            .addFields(
                {
                    name: `${EMOJIS.stock} **STOCK**`,
                    value: `**${quantity} available**`,
                    inline: false,
                },
                {
                    name: `${EMOJIS.price} **PRICE**`,
                    value: `**${price} each**`,
                    inline: true,
                },
                {
                    name: `${EMOJIS.status} **STATUS**`,
                    value: '**Available now**',
                    inline: true,
                },
                {
                    name: '**FORMAT**',
                    value: `\`${format}\``,
                    inline: false,
                },
            )
            .setFooter({ text: 'CaproStore • Stock announcement' })
            .setTimestamp();

        const buyButton = new ButtonBuilder()
            .setEmoji('<:cart:1540382163793612830>')
            .setLabel('Buy Now')
            .setStyle(ButtonStyle.Link)
            .setURL(BUY_CHANNEL_URL);

        const row = new ActionRowBuilder().addComponents(buyButton);

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ Posted the **${quantity}x ${product}** restock embed.`,
            ephemeral: true,
        });
    }),
};
