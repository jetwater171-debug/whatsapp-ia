import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
};

export const generateGeminiReply = async ({
  systemPrompt,
  messages,
  leadName,
  leadStatus,
  modelName,
  temperature,
}: {
  systemPrompt: string;
  messages: AiMessage[];
  leadName?: string | null;
  leadStatus?: string | null;
  modelName?: string | null;
  temperature?: number | null;
}) => {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: modelName || "gemini-2.5-flash",
    generationConfig: {
      temperature: temperature ?? 0.4,
    },
  });

  const contextLines = messages.map(
    (msg) => `${msg.role === "user" ? "Cliente" : "IA"}: ${msg.content}`
  );

  const prompt = [
    systemPrompt ||
      "Você é uma IA de vendas educada, objetiva e com foco em conversão.",
    `Nome do lead: ${leadName ?? "não informado"}.`,
    `Status do lead: ${leadStatus ?? "novo"}.`,
    "Histórico:",
    ...contextLines,
    "Responda de forma curta, mantendo o funil e pedindo o próximo passo.",
  ].join("\n");

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim();
};
