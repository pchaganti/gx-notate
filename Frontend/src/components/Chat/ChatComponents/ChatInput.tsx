import { LibraryModal } from "@/components/CollectionModals/LibraryModal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Library, Send, X, Mic, Loader2, Globe } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useUser } from "@/context/useUser";
import { useChatInput } from "@/context/useChatInput";
import { useSysSettings } from "@/context/useSysSettings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WebAudioRecorder } from "@/utils/webAudioRecorder";
import { useLibrary } from "@/context/useLibrary";
export const ChatInput = memo(function ChatInput() {
  const { activeUser, toggleTool, userTools, activeConversation } = useUser();
  const {
    handleChatRequest,
    cancelRequest,
    input,
    setInput,
    isLoading,
    setIsLoading,
  } = useChatInput();
  const { openLibrary, setOpenLibrary } = useLibrary();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const { isFFMPEGInstalled } = useSysSettings();
  const audioRecorder = useMemo(() => new WebAudioRecorder(), []);
  const { selectedCollection } = useLibrary();

  // Memoize the loading dots animation interval
  useEffect(() => {
    if (!transcriptionLoading) {
      setLoadingDots("");
      return;
    }

    const interval = setInterval(() => {
      setLoadingDots((prev: string) => (prev === "..." ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [transcriptionLoading]);

  // Memoize the recording handler
  const handleRecording = useCallback(async () => {
    try {
      if (!isRecording) {
        await audioRecorder.startRecording();
        setIsRecording(true);
      } else {
        setTranscriptionLoading(true);
        const audioData = await audioRecorder.stopRecording();
        setIsRecording(false);
        if (!activeUser?.id) {
          console.error("No active user ID found");
          setTranscriptionLoading(false);
          return;
        }
        const result = await window.electron.transcribeAudio(
          audioData,
          activeUser.id
        );

        if (!result.success) {
          console.error("Failed to transcribe audio:", result.error);
          setTranscriptionLoading(false);
          return;
        }

        if (result.transcription) {
          setInput((prev) => {
            const newInput = prev + (prev ? " " : "") + result.transcription;
            return newInput;
          });
        } else {
          console.warn("No transcription in result:", result);
        }

        setTranscriptionLoading(false);
      }
    } catch (error) {
      console.error("Error handling recording:", error);
      setIsRecording(false);
      setTranscriptionLoading(false);
    }
  }, [isRecording, audioRecorder, activeUser?.id, setInput]);

  // Memoize the tooltip content
  const tooltipContent = useMemo(() => {
    if (!isFFMPEGInstalled) return "Please install FFMPEG to use voice-to-text";
    if (transcriptionLoading) return "Transcribing your audio...";
    if (isRecording) return "Click to stop recording";
    return "Click to start voice recording";
  }, [isFFMPEGInstalled, transcriptionLoading, isRecording]);

  // Memoize the form submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim()) {
        handleChatRequest(selectedCollection?.id || undefined);
      }
    },
    [input, handleChatRequest, selectedCollection?.id]
  );

  // Memoize the send button handler
  const handleSendClick = useCallback(async () => {
    if (isLoading) {
      cancelRequest();
      setIsLoading(false);
    } else if (input.trim()) {
      await handleChatRequest(selectedCollection?.id || undefined);
    }
  }, [
    isLoading,
    input,
    cancelRequest,
    handleChatRequest,
    selectedCollection?.id,
    setIsLoading,
  ]);

  return (
    <div className="p-4 bg-card border-t border-secondary">
      <form onSubmit={handleSubmit} className="flex w-full items-center">
        <div className="flex flex-col items-center">
          <Sheet open={openLibrary} onOpenChange={setOpenLibrary}>
            <SheetTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="flex-shrink-0 rounded-none rounded-tl-[6px]"
              >
                <Library className="h-5 w-5" />
                <span className="sr-only">Library</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="max-h-[100vh] mt-8 overflow-y-auto p-6"
              side="left"
            >
              <SheetHeader>
                <SheetTitle>Data Store Library</SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <LibraryModal />
            </SheetContent>
          </Sheet>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  disabled={transcriptionLoading}
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleRecording}
                  className="flex-shrink-0 rounded-none rounded-bl-[6px] relative"
                >
                  {transcriptionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Mic
                      className={`h-5 w-5 ${
                        isRecording ? "animate-pulse" : ""
                      } ${!isFFMPEGInstalled ? "opacity-50" : ""}`}
                    />
                  )}
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 z-20 animate-pulse" />
                  )}
                  <span className="sr-only">
                    {transcriptionLoading
                      ? "Transcribing..."
                      : isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="absolute right-14 bottom-12 z-50">
          {userTools.map((tool) => (
            <Button
              key={tool.id}
              size="icon"
              variant={tool.enabled === 1 ? "secondary" : "outline"}
              onClick={() =>
                toggleTool({
                  id: tool.id,
                  name: tool.name,
                  enabled: tool.enabled,
                  docked: tool.docked,
                })
              }
              className={`${tool.enabled === 1 ? "opacity-100" : "opacity-40"}`}
            >
              {tool.name === "Web Search" ? <Globe /> : <></>}
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="Type your message here..."
          value={transcriptionLoading ? `Transcribing${loadingDots}` : input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                handleChatRequest(
                  selectedCollection?.id || undefined,
                  undefined,
                  activeConversation || undefined
                );
              }
            }
          }}
          disabled={transcriptionLoading}
          data-testid="chat-input"
          className={`z-10 max-h-[72px] min-h-[72px] flex-grow bg-background text-foreground placeholder-muted-foreground border-secondary rounded-none transition-opacity duration-200 [overflow-wrap:anywhere] ${
            transcriptionLoading ? "opacity-50" : "opacity-100"
          }`}
        />
        <Button
          type="button"
          size="icon"
          variant={isLoading ? "destructive" : "outline"}
          onClick={handleSendClick}
          data-testid="chat-submit"
          className="flex-shrink-0 h-[72px] w-[36px] rounded-none rounded-r-[6px]"
        >
          {isLoading ? <X className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">{isLoading ? "Cancel" : "Send"}</span>
        </Button>
      </form>
    </div>
  );
});
