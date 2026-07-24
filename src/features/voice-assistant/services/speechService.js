import { llamaConfig } from "../../../utils/llamaConfig";

export function isSpeechSupported() {
  return typeof window !== "undefined" && "webkitSpeechRecognition" in window;
}

export async function getOllamaResponse(prompt, model = "phi3:mini") {
  const endpoint = llamaConfig.getActiveEndpoint();
  if (!endpoint) {
    throw new Error("No Ollama endpoint is configured.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: `You are a helpful assistant for Mukesh's Mahara a full stack software engineer. Respond in a warm, natural conversational tone. Use short, friendly sentences and avoid robotic phrasing.\n\nUser: ${prompt}\nAssistant:`,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
        num_predict: 400,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.response || data.text || "";
}
