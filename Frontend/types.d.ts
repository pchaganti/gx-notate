type Statistics = {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  totalMemoryGB: number;
  cpuModel: string;
};

type UnsubscribeFunction = () => void;

type View =
  | "Chat"
  | "Library"
  | "Settings"
  | "Signup"
  | "SelectAccount"
  | "History"
  | "FileExplorer";

type User = {
  id: number;
  name: string;
};

type AzureModel = {
  id: number;
  name: string;
  endpoint: string;
  deployment: string;
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isRetrieval?: boolean;
  collectionId?: number;
  conversationId?: number;
  data_id?: number;
  data_content?: string;
};

type Settings = {
  vectorstore: string;
  prompt: string;
  temperature: number;
  model: string;
  provider: string;
};

interface UserPrompts {
  id: number;
  name: string;
  prompt: string;
  userId: number;
}
interface UserSettings {
  vectorstore?: string;
  prompt?: string;
  temperature?: number;
  model?: string;
  provider?: string;
  is_local?: boolean;
  model_dir?: string;
  local_embedding_model?: string;
  [key: string]: string | number | boolean | undefined;
}

type Collection = {
  id: number;
  name: string;
  description: string;
  type: string;
  files: string;
  userId: number;
};

type ApiKey = {
  id: number;
  key: string;
  provider: string;
};

type Conversation = {
  id: number;
  title: string;
  userId: number;
  created_at: Date;
};

type Prompt = {
  id: number;
  name: string;
  prompt: string;
  userId: number;
};

type FrameWindowAction = "close" | "minimize" | "maximize" | "unmaximize";

interface TranscribeAudioInput {
  userId: number;
  audioData: Buffer;
}

interface TranscribeAudioOutput {
  success: boolean;
  transcription?: string;
  language?: string;
  error?: string;
}

interface DownloadModelProgress {
  type: "progress";
  data: {
    message: string;
    fileName?: string;
    fileNumber?: number;
    totalFiles?: number;
    fileProgress?: number;
    totalProgress: number;
  };
}

interface EventPayloadMapping {
  resetAppState: void;
  statistics: Statistics;
  getStaticData: StaticData;
  frameWindowAction: FrameWindowAction;
  changeView: View;
  openDevTools: void;
  openDirectory: string;
  resizeWindow: {
    width: number;
    height: number;
  };
  chatRequest: {
    messages: Message[];
    activeUser: User;
    conversationId?: bigint | number;
    title?: string | undefined;
    collectionId?: bigint | number | undefined;
    requestId: number;
  };
  abortChatRequest: number;
  changeUser: void;
  quit: void;
  undo: void;
  redo: void;
  cut: void;
  copy: void;
  paste: void;
  delete: void;
  selectAll: void;
  print: void;
  chat: void;
  history: void;
  setApiKey: { success: boolean; apiKey?: string };
  messageChunk: string;
  streamEnd: void;
  offStreamEnd: void;
  getUsers: { users: { name: string; id: number }[] };
  addUser: { name: string };
  updateUserSettings: { userId: number; key: string; value: string };
  getUserSettings: { userId: number };
  getUserPrompts: { userId: number };
  addUserPrompt: { userId: number; name: string; prompt: string };
  updateUserPrompt: {
    userId: number;
    id: number;
    name: string;
    prompt: string;
  };
  openCollectionFolderFromFileExplorer: { filepath: string };
  openCollectionFolder: { filepath: string };
  addAPIKey: { userId: number; key: string; provider: string };
  createCollection: {
    userId: number;
    name: string;
    description: string;
    type: string;
    isLocal: boolean;
    localEmbeddingModel: string;
  };
  getConversationMessagesWithData: {
    userId: number;
    conversationId: number;
  };
  addUserConversation: { userId: number; input: string };
  deleteCollection: { userId: number; id: number; collectionName: string };
  getUserCollections: { userId: number };
  getUserApiKeys: { userId: number };
  getUserConversations: { userId: number };
  getConversationMessages: { userId: number; conversationId: number };
  addFileToCollection: {
    userId: number;
    userName: string;
    collectionId: number;
    collectionName: string;
    fileName: string;
    fileContent: string;
  };
  vectorstoreQuery: {
    userId: number;
    userName: string;
    collectionId: number;
    collectionName: string;
    query: string;
    conversationId: number;
  };
  getFilesInCollection: {
    userId: number;
    collectionId: number;
  };
  getPlatform: { platform: "win32" | "darwin" | "linux" };
  keyValidation: {
    apiKey: string;
    inputProvider: string;
  };
  youtubeIngest: {
    url: string;
    userId: number;
    userName: string;
    collectionId: number;
    collectionName: string;
  };
  systemSpecs: {
    cpu: string;
    vram: string;
    GPU_Manufacturer?: string;
  };
  stopRecording: { text: string };
  websiteFetch: {
    url: string;
    userId: number;
    userName: string;
    collectionId: number;
    collectionName: string;
  };
  webcrawl: {
    base_url: string;
    max_workers: number;
    collection_name: string;
    collection_id: number;
    user_id: number;
    user_name: string;
  };
  fetchOllamaModels: { models: string[] };
  "ingest-progress": string;
  cancelEmbed: { userId: number };
  deleteConversation: { userId: number; conversationId: number };
  resetUserState: void;
  checkOllama: { isOllamaRunning: boolean };
  runOllama: { model: string; user: User };
  ollamaProgress: OllamaProgressEvent;
  pullModel: { model: string };
  transcribeAudio: TranscribeAudioInput;
  checkIfFFMPEGInstalled: { success: boolean; message: boolean };
  deleteCollection: {
    collectionId: number;
    collectionName: string;
    userId: number;
  };
  loadModel: {
    model_location: string;
    model_name: string;
    model_type?: string;
    user_id: number;
  };
  addDevAPIKey: {
    userId: number;
    name: string;
    expiration: string | null;
  };
  getDevAPIKeys: { userId: number };
  deleteDevAPIKey: { userId: number; id: number };
  cancelWebcrawl: { userId: number };
  getUserCollectionFiles: {
    userId: number;
    userName: string;
  };
  removeFileorFolder: {
    userId: number;
    userName: string;
    file: string;
  };
  renameFile: {
    userId: number;
    userName: string;
    file: string;
    newName: string;
    success: boolean;
  };
  getOpenRouterModel: { userId: number };
  addOpenRouterModel: { userId: number; model: string };
  deleteOpenRouterModel: { userId: number; id: number };
  getOpenRouterModels: { userId: number };
  getDirModels: { dirPath: string };
  getModelInfo: {
    model_location: string;
    model_name: string;
    model_type?: string;
    user_id: number;
  };
  unloadModel: {
    model_location: string;
    model_name: string;
    model_type?: string;
    user_id: number;
  };
  downloadModel: {
    modelId: string;
    dirPath: string;
    hfToken?: string;
  };
  "download-model-progress": DownloadModelProgress;
  cancelDownload: { success: boolean };
  deleteAzureOpenAIModel: { userId: number; id: number };
  getAzureOpenAIModels: { userId: number };
  getAzureOpenAIModel: { userId: number; id: number };
  addAzureOpenAIModel: {
    userId: number;
    name: string;
    model: string;
    endpoint: string;
    api_key: string;
  };
  getModelsPath: string;
  getEmbeddingsModels: { models: Model[] };
}

interface Model {
  name: string;
  type: string;
  model_location: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface Window {
  electron: {
    unloadModel: (payload: {
      model_location: string;
      model_name: string;
      model_type?: string;
      user_id: number;
    }) => Promise<void>;
    getModelInfo: (payload: {
      model_location: string;
      model_name: string;
      model_type?: string;
      user_id: number;
    }) => Promise<{ model_info: Model }>;
    getDirModels: (dirPath: string) => Promise<{
      dirPath: string;
      models: Model[];
    }>;
    pullModel: (model: string) => Promise<void>;
    changeUser: () => Promise<void>;
    quit: () => Promise<void>;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    cut: () => Promise<void>;
    copy: () => Promise<void>;
    paste: () => Promise<void>;
    delete: () => Promise<void>;
    selectAll: () => Promise<void>;
    print: () => Promise<void>;
    chat: () => Promise<void>;
    history: () => Promise<void>;
    openDirectory: () => Promise<string>;
    cancelEmbed: (payload: { userId: number }) => Promise<void>;
    subscribeStatistics: (
      callback: (statistics: Statistics) => void
    ) => UnsubscribeFunction;
    getStaticData: () => Promise<StaticData>;
    subscribeChangeView: (
      callback: (view: View) => void
    ) => UnsubscribeFunction;
    openDevTools: () => void;
    sendFrameAction: (payload: FrameWindowAction) => void;
    resizeWindow: (width: number, height: number) => void;
    addUserConversation: (
      userId: number,
      input: string
    ) => Promise<{
      id: bigint | number;
      title: string;
    }>;
    chatRequest: (
      messages: Message[],
      activeUser: User,
      conversationId?: bigint | number,
      collectionId?: bigint | number | undefined,
      title?: string,
      requestId?: number
    ) => Promise<{
      messages: Message[];
      conversationId?: bigint | number;
      title: string;
      error?: string;
    }>;
    fetchOllamaModels: () => Promise<{ models: OllamaModel[] }>;
    abortChatRequest: (requestId: number) => void;
    onMessageChunk: (callback: (chunk: string) => void) => void;
    offMessageChunk: (callback: (chunk: string) => void) => void;
    onStreamEnd: (callback: () => void) => void;
    offStreamEnd: (callback: () => void) => void;
    setApiKey: (
      apiKey?: string
    ) => Promise<{ success: boolean; apiKey?: string }>;
    getUsers: () => Promise<{ users: { name: string; id: number }[] }>;
    addUser: (name: string) => Promise<{ name: string }>;
    updateUserSettings: (
      userId: number,
      key: string,
      value: string
    ) => Promise<{ userId: number; key: string; value: string }>;
    getUserSettings: (userId: number) => Promise<UserSettings>;
    getUserPrompts: (userId: number) => Promise<{ prompts: UserPrompts[] }>;
    addUserPrompt: (
      userId: number,
      name: string,
      prompt: string
    ) => Promise<UserPrompts>;
    getPlatform: () => Promise<{ platform: "win32" | "darwin" | "linux" }>;
    updateUserPrompt: (
      userId: number,
      id: number,
      name: string,
      prompt: string
    ) => Promise<UserPrompts>;
    addAPIKey: (
      userId: number,
      key: string,
      provider: string
    ) => Promise<{ userId: number; key: string; provider: string }>;
    createCollection: (
      userId: number,
      name: string,
      description: string,
      type: string,
      isLocal: boolean,
      localEmbeddingModel: string
    ) => Promise<{
      id: number;
      name: string;
      description: string;
      type: string;
    }>;
    removeFileorFolder: (
      userId: number,
      userName: string,
      file: string
    ) => Promise<{
      userId: number;
      userName: string;
      file: string;
      success: boolean;
    }>;
    renameFile: (
      userId: number,
      userName: string,
      file: string,
      newName: string
    ) => Promise<{
      userId: number;
      userName: string;
      file: string;
      newName: string;
      success: boolean;
    }>;
    getUserCollections: (
      userId: number
    ) => Promise<{ collections: Collection[] }>;
    getUserApiKeys: (userId: number) => Promise<{ apiKeys: ApiKey[] }>;
    getUserConversations: (
      userId: number
    ) => Promise<{ conversations: Conversation[] }>;
    addFileToCollection: (
      userId: number,
      userName: string,
      collectionId: number,
      collectionName: string,
      fileName: string,
      fileContent: string
    ) => Promise<{
      result: {
        success: boolean;
      };
    }>;
    openCollectionFolder: (filepath: string) => void;
    openCollectionFolderFromFileExplorer: (filepath: string) => void;
    vectorstoreQuery: (
      userId: number,
      userName: string,
      collectionId: number,
      collectionName: string,
      query: string,
      conversationId: number
    ) => Promise<{
      results: {
        content: string;
        source: string;
      }[];
      conversationId: number;
      status: string;
    }>;
    getFilesInCollection: (
      userId: number,
      collectionId: number
    ) => Promise<{
      files: string[];
    }>;
    getConversationMessagesWithData: (
      userId: number,
      conversationId: number,
      collectionId?: number
    ) => Promise<{ messages: Message[] }>;
    keyValidation: ({
      apiKey: string,
      inputProvider: string,
    }) => Promise<{ error?: string; success?: boolean }>;
    getConversationMessages: (
      userId: number,
      conversationId: number
    ) => Promise<{ messages: Message[] }>;
    onIngestProgress: (
      callback: (event: Electron.IpcRendererEvent, message: string) => void
    ) => void;
    on: (
      channel:
        | "ingest-progress"
        | "ollama-progress"
        | "download-model-progress",
      func: (
        event: Electron.IpcRendererEvent,
        message: string | OllamaProgressEvent | DownloadModelProgress
      ) => void
    ) => void;
    removeListener: (
      channel:
        | "ingest-progress"
        | "ollama-progress"
        | "download-model-progress",
      func: (
        event: Electron.IpcRendererEvent,
        message: string | OllamaProgressEvent | DownloadModelProgress
      ) => void
    ) => void;
    deleteConversation: (
      userId: number,
      conversationId: number
    ) => Promise<{ userId: number; conversationId: number }>;
    youtubeIngest: (
      url: string,
      userId: number,
      userName: string,
      collectionId: number,
      collectionName: string
    ) => Promise<{
      url: string;
      userId: number;
      userName: string;
      collectionId: number;
      collectionName: string;
    }>;
    systemSpecs: () => Promise<{
      cpu: string;
      vram: string;
      GPU_Manufacturer?: string;
    }>;
    checkOllama: () => Promise<{ isOllamaRunning: boolean }>;
    runOllama: (
      model: string,
      user: User
    ) => Promise<{ success: boolean; error?: string }>;
    websiteFetch: (
      url: string,
      userId: number,
      userName: string,
      collectionId: number,
      collectionName: string
    ) => Promise<{
      success: boolean;
      content?: string;
      textContent?: string;
      metadata?: {
        title: string;
        description: string;
        author: string;
        keywords: string;
        ogImage: string;
      };
    }>;
    getEmbeddingsModels: () => Promise<{ models: Model[] }>;
    webcrawl: (payload: {
      base_url: string;
      user_id: number;
      user_name: string;
      collection_id: number;
      collection_name: string;
      max_workers: number;
    }) => Promise<{
      base_url: string;
      user_id: number;
      user_name: string;
      collection_id: number;
      collection_name: string;
      max_workers: number;
      status: string;
    }>;
    deleteAzureOpenAIModel: (
      userId: number,
      id: number
    ) => Promise<{
      userId: number;
      id: number;
      success: boolean;
    }>;
    getAzureOpenAIModels: (userId: number) => Promise<{
      models: {
        name: string;
        model: string;
        endpoint: string;
        api_key: string;
      }[];
    }>;
    getAzureOpenAIModel: (
      userId: number,
      id: number
    ) => Promise<{
      name: string;
      model: string;
      endpoint: string;
      api_key: string;
    }>;
    addAzureOpenAIModel: (
      userId: number,
      name: string,
      model: string,
      endpoint: string,
      api_key: string
    ) => Promise<{
      id: number;
    }>;
    downloadModel: (payload: {
      modelId: string;
      dirPath: string;
      hfToken?: string;
    }) => Promise<void>;
    cancelDownload: () => Promise<{ success: boolean }>;
    subscribeResetUserState: (callback: () => void) => UnsubscribeFunction;
    transcribeAudio: (
      audioData: ArrayBuffer,
      userId: number
    ) => Promise<TranscribeAudioOutput>;
    checkIfFFMPEGInstalled: () => Promise<{
      success: boolean;
      message: boolean;
    }>;
    deleteCollection: (
      collectionId: number,
      collectionName: string,
      userId: number
    ) => Promise<{
      collectionId: number;
      collectionName: string;
      userId: number;
    }>;
    addDevAPIKey: (
      userId: number,
      name: string,
      expiration: string | null
    ) => Promise<Keys>;
    getDevAPIKeys: (userId: number) => Promise<{ keys: Keys[] }>;
    deleteDevAPIKey: (
      userId: number,
      id: number
    ) => Promise<{
      userId: number;
      id: number;
      result: boolean;
    }>;
    cancelWebcrawl: (userId: number) => Promise<{
      userId: number;
      result: boolean;
    }>;
    getUserCollectionFiles: (
      userId: number,
      userName: string
    ) => Promise<{
      files: string[];
    }>;
    getOpenRouterModel: (userId: number) => Promise<{ model: string }>;
    addOpenRouterModel: (userId: number, model: string) => Promise<void>;
    deleteOpenRouterModel: (userId: number, id: number) => Promise<void>;
    getOpenRouterModels: (userId: number) => Promise<{ models: string[] }>;
    loadModel: (payload: {
      model_location: string;
      model_name: string;
      model_type?: string;
      user_id: number;
    }) => Promise<void>;
    getModelsPath: () => Promise<string>;
  };
}
type Keys = {
  id: number;
  userId: number;
  name: string;
  key: string;
  expiration: string | null;
};
interface DataContent {
  top_k: string;
  results: {
    content: string;
    metadata: {
      source: string;
      title?: string;
      chunk_start?: number;
      chunk_end?: number;
    };
  }[];
}

type OpenRouterModel = string;

interface ProgressData extends CustomProgressData, OllamaProgressEvent {}

type LLMProvider =
  | "OpenAI"
  | "Anthropic"
  | "Gemini"
  | "XAI"
  | "Openrouter"
  | "Local"
  | "Ollama"
  | "Azure Open AI"
  | "Custom";

interface OllamaProgressEvent {
  type: "pull" | "verify";
  output: string;
}

interface Electron {
  on(
    channel: "ingest-progress" | "ollama-progress" | "download-model-progress",
    func: (
      event: Electron.IpcRendererEvent,
      message: string | OllamaProgressEvent | DownloadModelProgress
    ) => void
  ): void;
  removeListener(
    channel: "ingest-progress" | "ollama-progress" | "download-model-progress",
    func: (
      event: Electron.IpcRendererEvent,
      message: string | OllamaProgressEvent | DownloadModelProgress
    ) => void
  ): void;
}

interface APIKey {
  id: number;
  key: string;
  name: string;
  expiration: string | null;
}

type CustomProgressData = {
  type?:
    | "info"
    | "progress"
    | "start"
    | "processing"
    | "saved"
    | "links"
    | "embedding_start"
    | "embedding_progress"
    | "complete"
    | "error";
  message?: string;
  chunk?: number;
  totalChunks?: number;
  percent_complete?: string;
  est_remaining_time?: string;
  status?: "success" | "error" | "progress";
  current?: number;
  total?: number;
  url?: string;
  count?: number;
  current_batch?: number;
  total_batches?: number;
  data?: {
    message?: string;
    chunk?: number;
    total_chunks?: number;
    percent_complete?: string;
  };
};

interface DownloadProgress {
  type: "progress";
  data: DownloadProgressData;
}
interface OllamaModel {
  name: string;
  type: string;
}
interface DownloadProgressData {
  message: string;
  fileName?: string;
  fileNumber?: number;
  totalFiles?: number;
  fileProgress?: number;
  totalProgress: number;
  currentSize?: string;
  totalSize?: string;
  currentStep?: string;
  speed?: string;
}
