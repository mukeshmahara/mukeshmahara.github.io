import { getOllamaResponse, isSpeechSupported } from "./speechService";

describe("AI assistant service", () => {
  it("detects browser speech support when the API exists", () => {
    const original = window.webkitSpeechRecognition;
    window.webkitSpeechRecognition = function WebkitSpeechRecognition() {};

    expect(isSpeechSupported()).toBe(true);

    window.webkitSpeechRecognition = original;
  });

  it("returns a fallback response when the Ollama request fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("offline")));

    await expect(getOllamaResponse("hello")).rejects.toThrow();
  });
});
