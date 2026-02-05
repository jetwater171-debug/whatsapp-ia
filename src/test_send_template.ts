
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = `https://graph.facebook.com/v19.0`;
const TARGET_NUMBER = '5511951590272';

async function sendTemplate() {
    console.log("Fetching credentials...");
    const { data: accessToken } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_access_token').single();
    const { data: phoneId } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_phone_id').single();

    if (!accessToken?.value || !phoneId?.value) {
        console.error("Missing credentials in DB");
        return;
    }

    console.log(`Sending hello_world to ${TARGET_NUMBER} using Phone ID ${phoneId.value}...`);

    try {
        const res = await fetch(`${BASE_URL}/${phoneId.value}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.value}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: TARGET_NUMBER,
                type: "template",
                template: {
                    name: "hello_world",
                    language: { code: "en_US" }
                }
            })
        });

        const data = await res.json();
        console.log("Meta API Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

sendTemplate();
