import { NextRequest, NextResponse } from 'next/server';
import { verifyDiscordRequest } from '@/lib/discord/interactions';
import { InteractionType, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
    const DISCLAIMER_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
    if (!DISCLAIMER_PUBLIC_KEY) {
        return NextResponse.json({ error: 'Missing Discord Public Key' }, { status: 500 });
    }

    const { isValid, body } = await verifyDiscordRequest(req, DISCLAIMER_PUBLIC_KEY);

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
    }

    const interaction = JSON.parse(body);
    const { type, data, member } = interaction;

    // Handle PING
    if (type === InteractionType.PING) {
        return NextResponse.json({ type: InteractionResponseType.PONG });
    }

    // Handle Components (Buttons)
    if (type === InteractionType.MESSAGE_COMPONENT && data.component_type === MessageComponentTypes.BUTTON) {
        const customId = data.custom_id;

        // Check if it's a vote button
        if (customId.startsWith('vote:')) {
            // Format: vote:{candidateId}:{voteType}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, candidateId, voteType] = customId.split(':');

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!candidateId || !uuidRegex.test(candidateId)) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: '❌ Erreur: ID de candidature invalide.',
                        flags: 64, // Ephemeral
                    },
                });
            }

            // Validate vote type
            const validVoteTypes = ['yes', 'no', 'neutral'];
            if (!voteType || !validVoteTypes.includes(voteType)) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: '❌ Erreur: Type de vote invalide.',
                        flags: 64, // Ephemeral
                    },
                });
            }

            const discordUserId = member?.user?.id;

            if (!discordUserId) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: '❌ Erreur: Impossible de vous identifier.',
                        flags: 64, // Ephemeral
                    },
                });
            }

            // 1. Find member by discord_id
            const { data: memberData, error: memberError } = await supabaseAdmin
                .from('members')
                .select('id, role')
                .eq('discord_id', discordUserId)
                .single();

            if (memberError || !memberData) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `❌ Votre compte Discord n'est pas lié à un membre du site, ou vous n'êtes pas inscrit. Connectez-vous sur https://jsc-apply.vercel.app/login une fois pour lier votre compte.`,
                        flags: 64, // Ephemeral
                    },
                });
            }

            if (memberData.role === 'pending') {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: "❌ Vous devez être un membre approuvé pour voter.",
                        flags: 64, // Ephemeral
                    },
                });
            }

            // 2. Cast the vote
            // Check if already voted
            const { data: existingVote } = await supabaseAdmin
                .from('votes')
                .select('id')
                .eq('candidate_id', candidateId)
                .eq('voter_id', memberData.id)
                .single();

            if (existingVote) {
                await supabaseAdmin
                    .from('votes')
                    .update({ vote: voteType as Database['public']['Enums']['vote_type'] })
                    .eq('id', existingVote.id);
            } else {
                await supabaseAdmin
                    .from('votes')
                    .insert({
                        candidate_id: candidateId,
                        voter_id: memberData.id,
                        vote: voteType as Database['public']['Enums']['vote_type'],
                    });
            }

            // 3. Calculation of new vote counts
            const { data: allVotes } = await supabaseAdmin
                .from('votes')
                .select('vote')
                .eq('candidate_id', candidateId);

            const counts = {
                yes: 0,
                neutral: 0,
                no: 0
            };

            if (allVotes) {
                allVotes.forEach((v) => {
                    if (v.vote === 'yes') counts.yes++;
                    else if (v.vote === 'neutral') counts.neutral++;
                    else if (v.vote === 'no') counts.no++;
                });
            }

            // 4. Respond with updated message (Update buttons)
            return NextResponse.json({
                type: 7, // InteractionResponseType.UPDATE_MESSAGE
                data: {
                    components: [
                        {
                            type: 1, // Action Row
                            components: [
                                {
                                    type: 2, // Button
                                    style: 3, // Success
                                    label: `Pour (${counts.yes})`,
                                    emoji: { name: '✅' },
                                    custom_id: `vote:${candidateId}:yes`
                                },
                                {
                                    type: 2, // Button
                                    style: 2, // Secondary
                                    label: `Neutre (${counts.neutral})`,
                                    emoji: { name: '😐' },
                                    custom_id: `vote:${candidateId}:neutral`
                                },
                                {
                                    type: 2, // Button
                                    style: 4, // Danger
                                    label: `Contre (${counts.no})`,
                                    emoji: { name: '🛑' },
                                    custom_id: `vote:${candidateId}:no`
                                }
                            ]
                        }
                    ]
                }
            });
        }
    }

    return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
