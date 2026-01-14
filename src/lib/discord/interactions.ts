import { verifyKey } from 'discord-interactions';

export async function verifyDiscordRequest(request: Request, clientPublicKey: string) {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    if (!signature || !timestamp) {
        return { isValid: false, body };
    }

    const isValid = await verifyKey(
        body,
        signature,
        timestamp,
        clientPublicKey
    );

    return { isValid, body };
}
