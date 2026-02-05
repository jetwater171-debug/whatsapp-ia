import { supabaseServer as supabase } from '@/lib/supabaseServer';

const GRAPH_API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const getWhatsAppCredentials = async () => {
    const { data: verifyToken } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_verify_token').single();
    const { data: accessToken } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_access_token').single();
    const { data: phoneId } = await supabase.from('bot_settings').select('value').eq('key', 'whatsapp_phone_id').single();

    return {
        verifyToken: verifyToken?.value,
        accessToken: accessToken?.value,
        phoneId: phoneId?.value
    };
};

export const sendWhatsAppMessage = async (to: string, text: string) => {
    const { accessToken, phoneId } = await getWhatsAppCredentials();
    if (!accessToken || !phoneId) {
        console.error("WhatsApp credentials missing");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { body: text }
            })
        });

        const data = await res.json();
        if (data.error) {
            console.error("WhatsApp Send Error:", data.error);
        } else {
            console.log("WhatsApp Message Sent:", data);
        }
    } catch (e) {
        console.error("Failed to send WhatsApp message:", e);
    }
};

export const markWhatsAppMessageAsRead = async (messageId: string) => {
    const { accessToken, phoneId } = await getWhatsAppCredentials();
    if (!accessToken || !phoneId) return;

    try {
        await fetch(`${BASE_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId
            })
        });
    } catch (e) {
        console.error("Failed to mark as read:", e);
    }
};

export const sendWhatsAppLocation = async (to: string, lat: number, long: number, name: string, address: string) => {
    // Implement if needed for 'send_location' action
};

export const sendWhatsAppImage = async (to: string, imageUrl: string, caption?: string) => {
    const { accessToken, phoneId } = await getWhatsAppCredentials();
    if (!accessToken || !phoneId) return;

    try {
        await fetch(`${BASE_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "image",
                image: {
                    link: imageUrl,
                    caption: caption || ''
                }
            })
        });
    } catch (e) {
        console.error("Failed to send WhatsApp image:", e);
    }
};

export const sendWhatsAppVideo = async (to: string, videoUrl: string, caption?: string) => {
    const { accessToken, phoneId } = await getWhatsAppCredentials();
    if (!accessToken || !phoneId) return;

    try {
        await fetch(`${BASE_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "video",
                video: {
                    link: videoUrl,
                    caption: caption || ''
                }
            })
        });
    } catch (e) {
        console.error("Failed to send WhatsApp video:", e);
    }
};

export const getWhatsAppMediaUrl = async (mediaId: string): Promise<string | null> => {
    const { accessToken } = await getWhatsAppCredentials();
    if (!accessToken) return null;

    try {
        const res = await fetch(`${BASE_URL}/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.url) return data.url; // This URL requires auth to download
        return null;
    } catch (e) {
        console.error("Error getting media URL:", e);
        return null;
    }
}

export const sendWhatsAppTemplate = async (to: string, templateName: string, languageCode: string = "en_US") => {
    const { accessToken, phoneId } = await getWhatsAppCredentials();
    if (!accessToken || !phoneId) return { error: "Credentials missing" };

    try {
        const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            })
        });

        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Failed to send WhatsApp template:", e);
        return { error: e };
    }
};
