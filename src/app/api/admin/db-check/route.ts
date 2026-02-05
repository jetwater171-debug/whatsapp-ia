import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export async function GET() {
    try {
        // Try to select the whatsapp_id column from sessions
        const { data, error } = await supabase
            .from('sessions')
            .select('whatsapp_id')
            .limit(1);

        if (error) {
            return NextResponse.json({
                ok: false,
                message: 'Column whatsapp_id likely missing',
                details: error.message,
                hint: "NEED_MIGRATION"
            });
        }

        return NextResponse.json({ ok: true, message: 'Database seems migrated' });
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: e.message });
    }
}
