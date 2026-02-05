
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log("Checking database logs...");

    // 1. Check Sessions
    const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (sessionError) console.error("Session Error:", sessionError);
    else console.log("Recent Sessions:", JSON.stringify(sessions, null, 2));

    // 2. Check Messages
    const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (msgError) console.error("Message Error:", msgError);
    else console.log("Recent Messages:", JSON.stringify(messages, null, 2));
}

checkDatabase();
