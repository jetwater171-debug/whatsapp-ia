import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export async function GET() {
    const { data } = await supabase
        .from('bot_settings')
        .select('*');

    const settings: any = {};
    if (data) {
        data.forEach((row: any) => {
            settings[row.key] = row.value;
        });
    }

    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const updates = [];
        // Telegram token removed

        if (body.whatsapp_verify_token !== undefined) updates.push({ key: 'whatsapp_verify_token', value: body.whatsapp_verify_token });
        if (body.whatsapp_access_token !== undefined) updates.push({ key: 'whatsapp_access_token', value: body.whatsapp_access_token });
        if (body.whatsapp_phone_id !== undefined) updates.push({ key: 'whatsapp_phone_id', value: body.whatsapp_phone_id });

        for (const update of updates) {
            const { error } = await supabase.from('bot_settings').upsert(update);
            if (error) throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
    }
}
