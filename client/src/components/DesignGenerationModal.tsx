import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import "@google/model-viewer";
import api from "@/services/api";

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
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = ["traditional", "modern", "fusion", "minimalist", "ornate", "rustic", "contemporary"];

  const generateModel = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setModelUrl(null);

    try {
      const payload = {
        prompt: `${style} style ${prompt}`,
        textured: false // Use untextured for faster and more reliable generation
      };

      console.log('Sending generation request:', payload);
      
      // Generate 3D model using Meshifi
      const response = await api.post("/3d/generate", payload);
      const url = response.data.data.modelUrl;
      
      console.log('Model generated:', url);
      setModelUrl(url);
      
      // Call the onDesignGenerated callback if provided
      if (onDesignGenerated) {
        onDesignGenerated(response.data.data);
      }
    } catch (err: any) {
      console.error("3D Generation Error:", err);
      setError(err.response?.data?.message || "Failed to generate 3D model. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateModel();
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

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🤖 <strong>Powered by Meshifi AI:</strong> Describe your vision in detail. The AI will generate a 3D model based on your prompt.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating 3D Model...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate 3D Model
                </>
              )}
            </Button>
          </div>
        </form>

        {modelUrl && (
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
