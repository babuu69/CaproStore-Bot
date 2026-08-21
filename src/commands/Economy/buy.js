import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const EMOJIS = {
    bought: '<:ticks:1540381783613513788>',
    amount: '<:heart:1540381765217296544>',
    boughtBy: '<:mention:1540381800738721834>',
};

const THUMBNAIL_URL = 'https://cdn.discordapp.com/attachments/1494762741427208423/1540394808118476860/ChatGPT_Image_Aug_20_2026_03_22_50_PM.png?ex=6a89cbf5&is=6a887a75&hm=ed6f25bf344b76472ab653108a68485d568412e6213aa81cf5243f6a8b309283&';

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
