import { config } from "../config/env.js";

interface IMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const callAI = async (messages: IMessage[], jsonMode = false) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPEN_ROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.OPEN_ROUTER_LLM_MODEL,
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenRouter API Error:", error);
      throw new Error("AI generation failed");
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error("AI Call Error:", error);
    throw error;
  }
};
