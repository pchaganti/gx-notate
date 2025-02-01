import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { sendMessageChunk } from "../llmHelpers/sendMessageChunk.js";
import { BrowserWindow } from "electron";
import { Anthropic } from "@anthropic-ai/sdk";
import { z } from "zod";
import { webSearch } from "./tools/websearch.js";

export async function anthropicAgent(
  anthropic: Anthropic,
  messages: ChatCompletionMessageParam[],
  maxOutputTokens: number,
  userSettings: UserSettings,
  signal?: AbortSignal,
  mainWindow: BrowserWindow | null = null
): Promise<{
  content: string;
  webSearchResult: {
    metadata: {
      title: string;
      source: string;
      description: string;
      author: string;
      keywords: string;
      ogImage: string;
    };
    textContent: string;
  } | null;
}> {
  sendMessageChunk("[Agent]: ", mainWindow);
  const sysPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: `You are an AI Agent with the ability to visit websites and extract text and metadata. 
    Your task is to analyze the user's question and determine if visiting a website would help answer it.
    
    If web search would be helpful, respond with EXACTLY this JSON format:
    {
      "webUrl": 1,
      "url": "full_url_here"
    }
    
    If web search is not needed, respond with EXACTLY:
    {
      "webUrl": 0,
      "url": ""
    }
    
    Only respond with one of these two JSON formats, nothing else.
    Make sure the URL is a complete, valid URL starting with http:// or https://
    Do not include any explanation or additional text in your response.`,
  };

  const AgentActions = z.object({
    webUrl: z.number(),
    url: z.string(),
  });

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: maxOutputTokens,
    system: sysPrompt.content,
    messages: messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content as string,
    })),
  });

  let agentActions;
  try {
    const responseText = response.content[0].type === "text" ? response.content[0].text : "";
    agentActions = AgentActions.parse(JSON.parse(responseText.trim()));
  } catch (error) {
    console.error("Failed to parse agent response:", error);
    // Fallback to no web search if parsing fails
    agentActions = { webUrl: 0, url: "" };
  }

  let webSearchResult = null;
  if (agentActions.webUrl === 1 && agentActions.url) {
    try {
      webSearchResult = await webSearch({
        url: agentActions.url,
      });
      sendMessageChunk(
        "[REASONING]: Visiting website: " + agentActions.url + "\n",
        mainWindow
      );
    } catch (error) {
      console.error("Web search failed:", error);
      sendMessageChunk(
        "[REASONING]: Failed to visit website: " + agentActions.url + "\n",
        mainWindow
      );
    }
  }

  // Prepare final response
  const finalResponse = {
    content: webSearchResult 
      ? `Retrieved content from: ${agentActions.url}`
      : "No web search was needed or the search failed",
    webSearchResult
  };

  return finalResponse;
}
