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
    status: '<:ticks:1540381783613513788>',
    cart: '<:cart:1540382163793612830>',
};

const BUY_CHANNEL_URL = 'https://discord.com/channels/1494762739615137842/1494762742740029762';

export default {
    data: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Post a Steam product listing')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('game')
                .setDescription('Game name, e.g. GTA V')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('price')
                .setDescription('Custom price, e.g. $10, $5.99, or FREE')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('available')
                .setDescription('Available quantity')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100000)
        )
        .addStringOption(option =>
            option
                .setName('hours')
                .setDescription('Hours, e.g. 100+ Hours')
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
        const game = interaction.options.getString('game');
        const price = interaction.options.getString('price');
        const available = interaction.options.getInteger('available');
        const hours = interaction.options.getString('hours');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ I could not find a usable text channel.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(getColor('primary'))
            .setTitle(`${EMOJIS.verify} STEAM`)
            .setDescription([
                `${EMOJIS.stock} **GAME**`,
                `**${game}**`,
                '',
                `${EMOJIS.member} **AVAILABLE**`,
                `**${available}**`,
                '',
                `${EMOJIS.timer} **HOURS**`,
                `**${hours}**`,
                '',
                `${EMOJIS.price} **PRICE**`,
                `**${price}**`,
                '',
                `${EMOJIS.status} **STATUS**`,
                '**Available now**',
            ].join('\n'))
            .setFooter({ text: 'CaproStore • Steam' })
            .setTimestamp();

        const buyButton = new ButtonBuilder()
            .setEmoji(EMOJIS.cart)
            .setLabel('Buy Now')
            .setStyle(ButtonStyle.Link)
            .setURL(BUY_CHANNEL_URL);

        const row = new ActionRowBuilder().addComponents(buyButton);

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ Posted the **${game}** Steam listing.`,
            ephemeral: true,
        });
    }),
};
