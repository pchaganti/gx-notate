import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function returnSystemPrompt(
  prompt: string,
  dataCollectionInfo?: Collection | null,
  reasoning?: string | null,
  webSearchResult?: {
    metadata: {
      title: string;
      source: string;
      description: string;
      author: string;
      keywords: string;
      ogImage: string;
    };
    textContent: string;
  },
  data?: {
    top_k: number;
    results: {
      content: string;
      metadata: string;
    }[];
  } | null
) {
  const sysPrompt: ChatCompletionMessageParam = {
    role: "system",
    content:
      "When asked about previous messages, only consider messages marked as '(most recent message)' as the last message. " +
      prompt +
      (reasoning
        ? "\n\nUse this reasoning process to answer the question (Reasoning has already been provided, DO NOT RE-REASON): " +
          reasoning +
          "\n\n"
        : "") +
      (webSearchResult
        ? "\n\nThe following is the web results from the agent web tool used in the reasoning: " +
          JSON.stringify(webSearchResult) +
          "\n\n"
        : "") +
      (data
        ? "The following is the data that the user has provided via their custom data collection: " +
          `\n\n${JSON.stringify(data)}` +
          `\n\nCollection/Store Name: ${dataCollectionInfo?.name}` +
          `\n\nCollection/Store Files: ${dataCollectionInfo?.files}` +
          `\n\nCollection/Store Description: ${dataCollectionInfo?.description}`
        : ""),
  };

  return sysPrompt;
}
