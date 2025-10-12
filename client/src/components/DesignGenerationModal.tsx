import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import "@google/model-viewer"; // Make sure model-viewer is installed
import axios from "axios";

// Add TypeScript support for <model-viewer>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean;
        ar?: boolean;
        "shadow-intensity"?: string | number;
        style?: React.CSSProperties;
      };
    }
  }
}

interface DesignGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDesignGenerated: (result: any) => void; // Add this line
}

export function DesignGenerationModal({ isOpen, onClose, onDesignGenerated }: DesignGenerationModalProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("traditional");
  const [category, setCategory] = useState("Art");

  const [taskId, setTaskId] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  const styles = ["traditional", "modern", "fusion", "minimalist", "ornate", "rustic", "contemporary"];
  const categories = ["Ceramics", "Furniture", "Textiles", "Leather Goods", "Glass Art", "Kitchenware", "Jewelry", "Home Decor", "Clothing", "Art"];

  const submitTask = async () => {
    if (!prompt.trim()) return;

    setStatus("pending");
    setError(null);
    setModelUrl(null);

    try {
      const payload = {
        prompt,
        model_version: "v3.0-20250812",
        texture: true,
        pbr: true
      };

      // Call your backend API instead of Tripo3D directly
      const token = localStorage.getItem('token');
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const response = await axios.post("/api/tripo/task", payload, { headers });
      const newTaskId = response.data.data.task_id;
      setTaskId(newTaskId);

      // Start polling for task completion
      pollTask(newTaskId);
    } catch (err: any) {
      console.error("TripO3D Error:", err);
      setError(err.response?.data?.message || "Failed to submit task. Please try again.");
      setStatus("failed");
    }
  };

  const pollTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        "Authorization": `Bearer ${token}` 
      };
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;
        try {
          const response = await axios.get(`/api/tripo/task/${taskId}`, { headers });
          const data = response.data.data;

          if (data.status === "SUCCEEDED") {
            setModelUrl(data.model_urls.glb);
            setStatus("succeeded");
            clearInterval(interval);
            
            // Call the onDesignGenerated callback if provided
            if (onDesignGenerated) {
              onDesignGenerated(data);
            }
          } else if (data.status === "FAILED") {
            setError(data.task_error?.message || "Task failed");
            setStatus("failed");
            clearInterval(interval);
          }

          if (attempts > 20) {
            setError("Task timed out");
            setStatus("failed");
            clearInterval(interval);
          }
        } catch (err: any) {
          console.error("Poll Error:", err);
          setError("Failed to poll task status");
          setStatus("failed");
          clearInterval(interval);
        }
      }, 5000);
    } catch (err: any) {
      console.error("Poll Setup Error:", err);
      setError("Failed to start polling");
      setStatus("failed");
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    submitTask();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Design Generator
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Powered by TripO3D
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Design Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your custom craft idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((styleOption) => (
                    <SelectItem key={styleOption} value={styleOption}>
                      {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((categoryOption) => (
                    <SelectItem key={categoryOption} value={categoryOption}>
                      {categoryOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🤖 <strong>Powered by TripO3D:</strong> Describe your vision in detail. The AI will generate a 3D model based on your prompt.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={status === "pending"}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={status === "pending" || !prompt.trim()}
            >
              {status === "pending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Design
                </>
              )}
            </Button>
          </div>
        </form>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {status === "succeeded" && modelUrl && (
          <div className="mt-4">
            <model-viewer
              src={modelUrl}
              alt="Generated 3D Model"
              auto-rotate
              camera-controls
              ar
              shadow-intensity="1"
              style={{ width: "100%", height: "400px", borderRadius: "12px" }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
