import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const EMOJIS = {
    bought: '<:ticks:1540381783613513788>',
    amount: '<:heart:1540381765217296544>',
    boughtBy: '<:mention:1540381800738721834>',
};

const THUMBNAIL_URL = 'https://cdn.discordapp.com/attachments/1494762741427208422/1540506738334109847/file_000000003fdc820aaf18faffe7827587.png?ex=6a8a3433&is=6a88e2b3&hm=814fe7bc33526a82f567b8842dadde7fa8c61585f1e776bc72ff50e556595d07&';

export default {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Post a purchase announcement')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option
                .setName('bought')
                .setDescription('What was bought')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('amount')
                .setDescription('Amount purchased')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('bought-by')
                .setDescription('Who bought it')
                .setRequired(true)
        ),

    async execute(interaction) {
        const bought = interaction.options.getString('bought', true);
        const amount = interaction.options.getString('amount', true);
        const buyer = interaction.options.getUser('bought-by', true);

        const embed = new EmbedBuilder()
            .setColor('#7c3aed')
            .setThumbnail(THUMBNAIL_URL)
            .setDescription(
                [
                    `${EMOJIS.bought} **Bought**`,
                    `**${bought}**`,
                    '',
                    `${EMOJIS.amount} **Amount**`,
                    `**${amount}**`,
                    '',
                    `${EMOJIS.boughtBy} **Bought by**`,
                    `${buyer}`,
                ].join('\n')
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
