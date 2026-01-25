// utils/llamaConfig.js
export const llamaConfig = {
  // Ollama default endpoint
  ollamaEndpoint: "http://localhost:11434/api/generate",

  // llama.cpp server endpoint
  llamaCppEndpoint: "http://localhost:8000/v1/completions",

  // Hugging Face TGI endpoint (if using)
  tgiEndpoint: "http://localhost:8080/generate",

  getActiveEndpoint() {
    // You can add logic to detect which endpoint is available
    return this.ollamaEndpoint;
  },

  getRequestConfig(model = "llama3") {
    const endpoint = this.getActiveEndpoint();

    if (endpoint.includes("ollama")) {
      return {
        url: endpoint,
        body: {
          model: model,
          prompt: "",
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_predict: 500,
          },
        },
      };
    } else if (endpoint.includes("llama.cpp")) {
      return {
        url: endpoint,
        body: {
          prompt: "",
          temperature: 0.7,
          max_tokens: 500,
          stop: ["\n", "User:", "Assistant:"],
        },
      };
    }

    return null;
  },
};
