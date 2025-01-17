import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/useUser";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Openrouter() {
  const { openRouterModels } = useUser();
  const [openRouterModel, setOpenRouterModel] = useState<string>("");
  const [hasOpenRouter, setHasOpenRouter] = useState<boolean>(
    openRouterModels.length > 0
  );

  const handleAddOpenRouterModel = async () => {
    if (!openRouterModel.trim()) {
      toast({
        title: "Model Required",
        description: "Please enter an OpenRouter model ID.",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="space-y-2">
      {!hasOpenRouter && (
        <>
          <Input
            id="local-model-path"
            type="text"
            placeholder="Enter your OpenRouter API key"
            className="input-field"
          />
          <Button variant="secondary" className="w-full" onClick={() => {}}>
            Save API Key
          </Button>
        </>
      )}
      {hasOpenRouter && (
        <>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setHasOpenRouter(false)}
          >
            Update API Key
          </Button>
          <Input
            className="w-full"
            placeholder="Enter OpenRouter model ID (e.g. openai/gpt-3.5-turbo)"
            value={openRouterModel}
            onChange={(e) => setOpenRouterModel(e.target.value)}
          />
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleAddOpenRouterModel()}
          >
            Add Model
          </Button>
        </>
      )}
    </div>
  );
}
