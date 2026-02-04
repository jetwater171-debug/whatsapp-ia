import { env } from "@/lib/env";

export const sendWhatsAppMessage = async ({
  accessToken,
  phoneNumberId,
  to,
  text,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  text: string;
}) => {
  const url = `https://graph.facebook.com/${env.metaApiVersion}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar WhatsApp: ${errorText}`);
  }

  return response.json();
};
