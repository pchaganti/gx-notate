import { BrowserWindow } from "electron";
import db from "../db.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAIProvider } from "./providers/openai.js";
import { GeminiProvider } from "./providers/gemini.js";
import { XAIProvider } from "./providers/xai.js";
import { generateTitle } from "./generateTitle.js";
import { vectorstoreQuery } from "../embedding/vectorstoreQuery.js";
import { LocalModelProvider } from "./providers/localModel.js";
import { OpenRouterProvider } from "./providers/openrouter.js";
import { OllamaProvider } from "./providers/ollama.js";
import log from "electron-log";
import os from "os";
import { AzureOpenAIProvider } from "./providers/azureOpenAI.js";
import { CustomProvider } from "./providers/customEndpoint.js";
import { DeepSeekProvider } from "./providers/deepseek.js";

interface ProviderResponse {
  id: bigint | number;
  messages: Message[];
  title: string;
  content: string;
  reasoning?: string;
  aborted: boolean;
}

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(window: BrowserWindow) {
  mainWindow = window;
}

export async function chatRequest(
  messages: Message[],
  activeUser: User,
  conversationId?: bigint | number,
  title?: string,
  collectionId?: bigint | number,
  signal?: AbortSignal
): Promise<{
  messages: Message[];
  data_content?: string;
  reasoning_content?: string;
  id: bigint | number;
  title: string;
  error?: string;
}> {
  const platform = os.platform();

  try {
    let currentTitle: string | null = title || null;
    const userSettings = await db.getUserSettings(activeUser.id);
    if (!conversationId && currentTitle === null) {
      currentTitle = await generateTitle(
        messages[messages.length - 1].content,
        activeUser.id,
        userSettings.model
      );
    }

    let data: {
      top_k: number;
      results: {
        content: string;
        metadata: string;
      }[];
    } | null = null;
    if (collectionId) {
      const collectionName = await db.getCollectionName(Number(collectionId));
      log.info(`Collection name: ${collectionName}`);
      try {
        const vectorstoreData = await vectorstoreQuery({
          query: messages[messages.length - 1].content,
          userId: activeUser.id,
          userName: activeUser.name,
          collectionId: Number(collectionId),
          collectionName: collectionName.name,
        });

        if (vectorstoreData.status === "error") {
          if (vectorstoreData.message === "Unauthorized") {
            const newMessage = {
              role: "assistant",
              content:
                `There is an issue with the SECRET_KEY not being in sync across the front/backend.\n\n` +
                `Please try the following steps:\n` +
                `1. Restart your PC\n` +
                `2. If the issue persists, check your logs at:\n` +
                `   ${
                  platform === "darwin"
                    ? os.homedir() +
                      "/Library/Application Support/notate/main.log"
                    : platform === "win32"
                    ? os.homedir() + "/AppData/Roaming/notate/main.log"
                    : os.homedir() + "~/.config/notate/main.log"
                }\n\n` +
                `3. Open a GitHub issue at https://github.com/CNTRLAI/notate and include your logs`,
              timestamp: new Date(),
              data_content: undefined,
            } as Message;
            return {
              id: -1,
              messages: [...messages, newMessage],
              title: "Need API Key",
            };
          }
        }
        if (vectorstoreData) {
          data = {
            top_k: vectorstoreData.results.length,
            results: vectorstoreData.results,
          };
        }
      } catch (error) {
        const newMessage = {
          role: "assistant",
          content: `Error in vectorstore query: ${error}`,
          timestamp: new Date(),
          data_content: undefined,
        } as Message;
        log.error(`Error in vectorstore query: ${error}`);
        return {
          id: -1,
          messages: [...messages, newMessage],
          title: "Error in vectorstore query",
        };
      }
    }

    if (!currentTitle || currentTitle === undefined) {
      currentTitle = await db.getUserConversationTitle(
        Number(conversationId),
        activeUser.id
      );
    }
    log.info(`Current title: ${currentTitle}`);
    if (!conversationId) {
      const addConversation = await db.addUserConversation(
        activeUser.id,
        currentTitle
      );
      conversationId = addConversation.id;
    }

    let prompt;
    const getPrompt = await db.getUserPrompt(
      activeUser.id,
      Number(userSettings.promptId)
    );
    log.info(`Get prompt: ${getPrompt}`);
    if (getPrompt) {
      prompt = getPrompt.prompt;
    } else {
      prompt = "You are a helpful assistant.";
    }
    let provider;
    switch (userSettings.provider?.toLowerCase()) {
      case "openai":
        provider = OpenAIProvider;
        break;
      case "openrouter":
        provider = OpenRouterProvider;
        break;
      case "azure open ai":
        provider = AzureOpenAIProvider;
        break;
      case "anthropic":
        provider = AnthropicProvider;
        break;
      case "gemini":
        provider = GeminiProvider;
        break;
      case "xai":
        provider = XAIProvider;
        break;
      case "local":
        provider = LocalModelProvider;
        break;
      case "ollama":
        provider = OllamaProvider;
        break;
      case "custom":
        provider = CustomProvider;
        break;
      case "deepseek":
        provider = DeepSeekProvider;
        break;
      default:
        throw new Error(
          "No AI provider selected. Please open Settings (top right) make sure you add an API key and select a provider under the 'AI Provider' tab."
        );
    }
    if (!currentTitle) {
      currentTitle = messages[messages.length - 1].content.substring(0, 20);
    }
    if (!userSettings.temperature) {
      userSettings.temperature = 0.5;
    }
    const result = (await provider(
      messages,
      activeUser,
      userSettings,
      prompt,
      conversationId,
      mainWindow,
      currentTitle,
      Number(collectionId),
      data ? data : undefined,
      signal
    )) as ProviderResponse;
    try {
      // Add the user's message first
      db.addUserMessage(
        activeUser.id,
        Number(conversationId),
        "user",
        messages[messages.length - 1].content
      );
      log.info(`Added user message`);
      // Add the assistant's message
      const assistantMessageId = db.addUserMessage(
        activeUser.id,
        Number(conversationId),
        "assistant",
        result.content,
        result.reasoning,
        collectionId ? Number(collectionId) : undefined
      ).lastInsertRowid;
      log.info(`Added assistant message`);
      // If we have data from retrieval, add it
      if (data !== null) {
        db.addRetrievedData(Number(assistantMessageId), JSON.stringify(data));
        log.info(`Added retrieved data`);
      }
    } catch (error) {
      // If we get a foreign key constraint error, it likely means the message was already added
      // We can safely ignore this and continue
      if (
        !(
          error instanceof Error &&
          "code" in error &&
          error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
        )
      ) {
        throw error;
      }
    }

    log.info(`Returning result`);
    return {
      ...result,
      messages: result.messages.map(msg => ({
        ...msg,
        reasoning_content: msg.role === "assistant" ? result.reasoning : undefined
      })),
      data_content: data ? JSON.stringify(data) : undefined,
      reasoning_content: result.reasoning ? result.reasoning : undefined,
      title:
        currentTitle || messages[messages.length - 1].content.substring(0, 20),
    };
  } catch (error) {
    log.error("Error in chat request:", error);

    const newMessage = {
      role: "assistant",
      content: "Please add an API key and select an AI Model in Settings.",
      timestamp: new Date(),
      data_content: undefined,
    } as Message;
    log.info(`New message: ${newMessage}`);
    return {
      id: -1,
      messages: [...messages, newMessage],
      title: "Need API Key",
    };
  }
}
