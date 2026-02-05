import { NextRequest, NextResponse, after } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
// @ts-ignore
import { markWhatsAppMessageAsRead } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
    // Webhook Verification
    const mode = req.nextUrl.searchParams.get('hub.mode');
    const token = req.nextUrl.searchParams.get('hub.verify_token');
    const challenge = req.nextUrl.searchParams.get('hub.challenge');

    const { data: dbToken } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_verify_token').single();

    if (mode === 'subscribe' && token === (dbToken?.value || 'DEFAULT_VERIFY_TOKEN')) {
        console.log("WEBHOOK_VERIFIED");
        return new NextResponse(challenge, { status: 200 });
    } else {
        return new NextResponse('Forbidden', { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (!messages || messages.length === 0) {
            return NextResponse.json({ ok: true });
        }

        const message = messages[0];
        const from = message.from; // User's WhatsApp ID (Phone Number)
        const name = value.contacts?.[0]?.profile?.name || "Desconhecido";
        const msgType = message.type;
        const msgBody = msgType === 'text' ? message.text.body : `[MEDIA: ${msgType}]`;

        console.log(`[WHATSAPP] Received from ${from}: ${msgBody}`);

        // 1. Get or Create Session
        // Note: We use the 'whatsapp_id' column or 'telegram_chat_id' if reusing (migrating).
        // Let's assume we migrated and added 'whatsapp_id'.
        // If not, we might reuse telegram_chat_id logic if it's just a string, but better to be explicit.

        // For compatibility with existing 'process-message' which uses 'telegram_chat_id' heavily, 
        // we might store the phone number there too, OR update process-message.
        // Let's store in 'telegram_chat_id' TEMPORARILY if 'whatsapp_id' column doesn't exist, 
        // BUT ideally we update the schema.
        // Let's try to query by whatsapp_id first.

        let { data: session, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('whatsapp_id', from)
            .single();

        if (error || !session) {
            // Try creating
            console.log("Creating new WhatsApp session for", from);
            const { data: newSession, error: createError } = await supabase
                .from('sessions')
                .insert([{
                    whatsapp_id: from,
                    telegram_chat_id: from, // Fallback/Reuse for compatibility checking
                    user_city: null,
                    device_type: "WhatsApp",
                    user_name: name,
                    status: 'active'
                }])
                .select()
                .single();

            if (createError) {
                console.error("Failed to create session", createError);
                return NextResponse.json({ error: 'DB Error' }, { status: 500 });
            }
            session = newSession;
        }

        // 2. Mark as Read
        await markWhatsAppMessageAsRead(message.id);

        // 3. Save Message
        // Normalize Content
        let content = msgBody;
        if (msgType === 'image') {
            content = `[PHOTO_UPLOAD] ID: ${message.image.id} | Caption: ${message.image.caption || ''}`;
        } else if (msgType === 'audio') {
            content = `[AUDIO_UUID: ${message.audio.id}]`; // Reusing pattern for compatibility
        } else if (msgType === 'video') {
            content = `[VIDEO_UPLOAD] ID: ${message.video.id} | Caption: ${message.video.caption || ''}`;
        }

        const { data: insertedMsg } = await supabase.from('messages').insert({
            session_id: session.id,
            sender: 'user',
            content: content,
            // We might want to store raw json or ID for media retrieval
        }).select().single();

        if (!insertedMsg) return NextResponse.json({ ok: true });

        // 4. Trigger Worker
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const workerUrl = `${protocol}://${host}/api/process-message`;

        after(async () => {
            try {
                await fetch(workerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: session.id,
                        triggerMessageId: insertedMsg.id,
                        platform: 'whatsapp' // Hint to worker
                    })
                });
            } catch (err) {
                console.error("Worker trigger failed:", err);
            }
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
