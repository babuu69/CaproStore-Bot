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

const EMOJIS = {
    verify: '<a:verify:1539966415468101632>',
    nfa: '<:bluedot:1539966417338769409>',
    unbanned: '<:ticktyfy:1539966407029297193>',
    banned: '<:x_:1540383734828892291>',
    timer: '<:timer:1540381779960266784>',
    instant: '<:ticks:1540381783613513788>',
    stock: '<:star:1540381763099168789>',
    price: '<:arrow:1540381810729558076>',
    status: '<:ticks:1540381783613513788>',
    cart: '<:cart:1540382163793612830>',
};

const BUY_CHANNEL_URL = 'https://discord.com/channels/1494762739615137842/1494762742740029762';

export default {
    data: new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription('Post a Minecraft stock/product listing')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Product name, e.g. MFA Hypixel')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantity')
                .setDescription('Available quantity')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100000)
        )
        .addStringOption(option =>
            option
                .setName('price')
                .setDescription('Custom price, e.g. $5, $5.99, or FREE')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('access')
                .setDescription('Access type')
                .setRequired(true)
                .addChoices(
                    { name: '<:bluedot:1539966417338769409> NFA', value: 'NFA' },
                    { name: '<:bluedot:1539966417338769409> MFA', value: 'MFA' },
                )
        )
        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('Product status')
                .setRequired(true)
                .addChoices(
                    { name: '<:ticktyfy:1539966407029297193> Unbanned', value: 'Unbanned' },
                    { name: '<:x_:1540383734828892291> Banned', value: 'Banned' },
                )
        )
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('Warranty/time, e.g. 12-hour')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('format')
                .setDescription('Product format, e.g. username:refreshToken')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to post the listing in')
                .setRequired(false)
        ),

    category: 'Economy',

    execute: withErrorHandling(async (interaction) => {
        const name = interaction.options.getString('name');
        const quantity = interaction.options.getInteger('quantity');
        const price = interaction.options.getString('price');
        const access = interaction.options.getString('access');
        const status = interaction.options.getString('status');
        const time = interaction.options.getString('time');
        const format = interaction.options.getString('format');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ I could not find a usable text channel.',
                ephemeral: true,
            });
        }

        const accessDisplay = `${EMOJIS.nfa} **${access}**`;
        const statusDisplay = status === 'Unbanned'
            ? `${EMOJIS.unbanned} **Unbanned**`
            : `${EMOJIS.banned} **Banned**`;

        const embed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setTitle(`${EMOJIS.verify} MINECRAFT — ${quantity}x ${name}`)
            .setDescription([
                accessDisplay,
                statusDisplay,
                `${EMOJIS.timer} **${time} warranty**`,
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
            .setFooter({ text: 'CaproStore • Minecraft' })
            .setTimestamp();

        const buyButton = new ButtonBuilder()
            .setEmoji(EMOJIS.cart)
            .setLabel('Buy Now')
            .setStyle(ButtonStyle.Link)
            .setURL(BUY_CHANNEL_URL);

        const row = new ActionRowBuilder().addComponents(buyButton);

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ Posted the **${quantity}x ${name}** Minecraft listing.`,
            ephemeral: true,
        });
    }),
};
