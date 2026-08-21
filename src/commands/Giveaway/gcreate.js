import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

import { logger } from '../../utils/logger.js';
import { TitanBotError, ErrorTypes } from '../../utils/errorHandler.js';
import { saveGiveaway } from '../../utils/giveaways.js';
import { parseDuration, validatePrize, validateWinnerCount } from '../../services/giveawayService.js';
import { logEvent, EVENT_TYPES } from '../../services/loggingService.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { botConfig, getColor } from '../../config/bot.js';

const GIVEAWAY_MIN_WINNERS = botConfig.giveaways?.minimumWinners ?? 1;
const GIVEAWAY_MAX_WINNERS = botConfig.giveaways?.maximumWinners ?? 10;

const EMOJI = {
    confetti: { id: '1540396507474174033', name: 'confetti', animated: true },
    member: { id: '1540381772565577800', name: 'member' },
    timer: { id: '1540381779960266784', name: 'timer' },
    verify: { id: '1539966415468101632', name: 'verify', animated: true },
    info: { id: '1540381768807612416', name: 'info' },
    shield: { id: '1540381793033789450', name: 'shield' },
    heart: { id: '1540381765217296544', name: 'heart' },
    star: { id: '1540381763099168789', name: 'star' },
};

function createBeautifulGiveawayEmbed(data) {
    const endTime = data.endsAt || data.endTime;

    return new EmbedBuilder()
        .setColor(getColor('giveaway.active'))
        .setTitle(`${customEmoji(EMOJI.confetti)} GIVEAWAY`)
        .setDescription(
            [
                `${customEmoji(EMOJI.star)} **Prize**`,
                `> **${data.prize}**`,
                '',
                `${customEmoji(EMOJI.member)} **Winners**`,
                `> **${data.winnerCount}**`,
                '',
                `${customEmoji(EMOJI.timer)} **Ends**`,
                `> <t:${Math.floor(endTime / 1000)}:R>`,
                '',
                `${customEmoji(EMOJI.heart)} **Good luck!**`,
            ].join('\n')
        )
        .setFooter({ text: `Hosted by ${data.hostName}` })
        .setTimestamp();
}

function customEmoji(emoji) {
    return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

function createBeautifulButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway_join')
            .setLabel('Enter Giveaway')
            .setEmoji(EMOJI.verify)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('giveaway_end')
            .setLabel('End Giveaway')
            .setEmoji(EMOJI.shield)
            .setStyle(ButtonStyle.Danger),
    );
}

export default {
    data: new SlashCommandBuilder()
        .setName('gcreate')
        .setDescription('Starts a new giveaway in a specified channel.')
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('How long the giveaway should last (e.g. 1h, 30m, 5d).')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('winners')
                .setDescription('The number of winners to pick.')
                .setMinValue(GIVEAWAY_MIN_WINNERS)
                .setMaxValue(GIVEAWAY_MAX_WINNERS)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('prize')
                .setDescription('The prize being given away.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to send the giveaway to.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });

        if (!interaction.inGuild()) {
            throw new TitanBotError(
                'Giveaway command used outside guild',
                ErrorTypes.VALIDATION,
                'This command can only be used in a server.',
                { userId: interaction.user.id }
            );
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            throw new TitanBotError(
                'User lacks ManageGuild permission',
                ErrorTypes.PERMISSION,
                "You need the 'Manage Server' permission to start a giveaway.",
                { userId: interaction.user.id, guildId: interaction.guildId }
            );
        }

        const durationString = interaction.options.getString('duration', true);
        const winnerCount = interaction.options.getInteger('winners', true);
        const prize = interaction.options.getString('prize', true);
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        const durationMs = parseDuration(durationString);
        validateWinnerCount(winnerCount);
        const prizeName = validatePrize(prize);

        if (!targetChannel?.isTextBased()) {
            throw new TitanBotError(
                'Target channel is not text-based',
                ErrorTypes.VALIDATION,
                'The channel must be a text channel.',
                { channelId: targetChannel?.id }
            );
        }

        const endTime = Date.now() + durationMs;

        const giveawayData = {
            messageId: 'placeholder',
            channelId: targetChannel.id,
            guildId: interaction.guildId,
            prize: prizeName,
            hostId: interaction.user.id,
            hostName: interaction.user.tag,
            endTime,
            endsAt: endTime,
            winnerCount,
            participants: [],
            isEnded: false,
            ended: false,
            createdAt: new Date().toISOString(),
        };

        const giveawayMessage = await targetChannel.send({
            embeds: [createBeautifulGiveawayEmbed(giveawayData)],
            components: [createBeautifulButtons()],
        });

        giveawayData.messageId = giveawayMessage.id;

        const saved = await saveGiveaway(
            interaction.client,
            interaction.guildId,
            giveawayData,
        );

        if (!saved) {
            logger.warn(`Failed to save giveaway: ${giveawayMessage.id}`);
        }

        try {
            await logEvent({
                client: interaction.client,
                guildId: interaction.guildId,
                eventType: EVENT_TYPES.GIVEAWAY_CREATE,
                data: {
                    description: `Giveaway created: ${prizeName}`,
                    channelId: targetChannel.id,
                    userId: interaction.user.id,
                    fields: [
                        { name: 'Prize', value: prizeName, inline: true },
                        { name: 'Winners', value: String(winnerCount), inline: true },
                        { name: 'Duration', value: durationString, inline: true },
                        { name: 'Channel', value: targetChannel.toString(), inline: true },
                    ],
                },
            });
        } catch (error) {
            logger.debug('Error logging giveaway creation event:', error);
        }

        await InteractionHelper.safeReply(interaction, {
            content: `${customEmoji(EMOJI.verify)} Giveaway created in ${targetChannel}.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
