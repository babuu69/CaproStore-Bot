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
    stock: '<:star:1540381763099168789>',
    member: '<:member:1540381772565577800>',
    timer: '<:timer:1540381779960266784>',
    price: '<:arrow:1540381810729558076>',
    shield: '<:shield:1540381793033789450>',
    status: '<:ticks:1540381783613513788>',
    cart: '<:cart:1540382163793612830>',
};

const BUY_CHANNEL_URL = 'https://discord.com/channels/1494762739615137842/1494762742740029762';

export default {
    data: new SlashCommandBuilder()
        .setName('netflix')
        .setDescription('Post a NETFLIX product listing')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('plan')
                .setDescription('Plan name, e.g. Premium')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('Duration, e.g. 1 Month')
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
                .setDescription('Custom price, e.g. $3, $5.99, or FREE')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('warranty')
                .setDescription('Warranty, e.g. 30 Days')
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
        const plan = interaction.options.getString('plan');
        const duration = interaction.options.getString('duration');
        const quantity = interaction.options.getInteger('quantity');
        const price = interaction.options.getString('price');
        const warranty = interaction.options.getString('warranty');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ I could not find a usable text channel.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setTitle(`${EMOJIS.verify} NETFLIX`)
            .setDescription([
                `${EMOJIS.stock} **PLAN**`,
                `**${plan}**`,
                '',
                `${EMOJIS.member} **AVAILABLE**`,
                `**${quantity}**`,
                '',
                `${EMOJIS.timer} **DURATION**`,
                `**${duration}**`,
                '',
                `${EMOJIS.price} **PRICE**`,
                `**${price}**`,
                '',
                `${EMOJIS.shield} **WARRANTY**`,
                `**${warranty}**`,
                '',
                `${EMOJIS.status} **STATUS**`,
                '**Available now**',
            ].join('\n'))
            .setFooter({ text: 'CaproStore • NETFLIX' })
            .setTimestamp();

        const buyButton = new ButtonBuilder()
            .setEmoji(EMOJIS.cart)
            .setLabel('Buy Now')
            .setStyle(ButtonStyle.Link)
            .setURL(BUY_CHANNEL_URL);

        const row = new ActionRowBuilder().addComponents(buyButton);

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ Posted the **${plan} ${duration}** NETFLIX listing.`,
            ephemeral: true,
        });
    }),
};
