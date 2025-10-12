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
        loading?: string;
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
  const [step, setStep] = useState<'generate' | 'select-artisan'>('generate');
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);

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
      
      console.log('Full response:', response.data);
      
      const url = response.data.data.modelUrl;
      const isDemo = response.data.data.isDemo;
      const message = response.data.data.message;
      
      console.log('Model generated:', url);
      console.log('Is demo model:', isDemo);
      console.log('Message:', message);
      
      if (!url) {
        throw new Error('No model URL returned from server');
      }
      
      // Set the model URL regardless of whether it's demo or real
      setModelUrl(url);
      setDesignId(response.data.data.designId);
      
      // Show info if it's a demo model
      if (isDemo) {
        console.warn('Using demo model:', message);
      }
      
      // Don't call onDesignGenerated here - let user view and decide
      // The callback will be called when they manually close or take action
    } catch (err: any) {
      console.error("3D Generation Error:", err);
      const errorMessage = err.response?.data?.message || "Failed to generate 3D model. Please try again.";
      const suggestion = err.response?.data?.suggestion || "";
      setError(errorMessage + (suggestion ? `\n\n${suggestion}` : ""));
      // setError(err.response?.data?.message || err.message || "Failed to generate 3D model. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateModel();
  };

  const fetchArtisans = async () => {
    setLoadingArtisans(true);
    try {
      const response = await api.get('/artisans');
      setArtisans(response.data.data.artisans || []);
      setStep('select-artisan');
    } catch (err: any) {
      console.error('Error fetching artisans:', err);
      setError('Failed to load artisans. Please try again.');
    } finally {
      setLoadingArtisans(false);
    }
  };

  const handleSelectArtisan = async (artisan: any) => {
    try {
      // Navigate to message center with artisan and design info
      if (onDesignGenerated) {
        onDesignGenerated({
          modelUrl,
          designId,
          artisan,
          prompt,
          redirectToChat: true
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Error selecting artisan:', err);
      setError('Failed to proceed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {step === 'generate' ? '3D Model Generator' : 'Choose Your Artisan'}
            {step === 'generate' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Powered by Meshifi AI
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'select-artisan' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an artisan to discuss your 3D model and place an order
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {artisans.map((artisan) => (
                <div
                  key={artisan._id}
                  className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleSelectArtisan(artisan)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                      {artisan.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{artisan.user?.name || 'Artisan'}</h3>
                      <p className="text-sm text-primary">{artisan.businessInfo?.businessName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-yellow-500">
                          <span className="text-sm">⭐ {artisan.ratings?.average || 0}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({artisan.ratings?.count || 0} reviews)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {artisan.businessInfo?.description || 'Skilled artisan'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {artisan.skills?.specialties?.slice(0, 3).map((specialty: string, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('generate')}
                className="flex-1"
              >
                ← Back to Model
              </Button>
            </div>
          </div>
        ) : (
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

          {!modelUrl && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                🤖 <strong>Powered by Meshifi AI:</strong> Describe your vision in detail. The AI will generate a high-quality 3D model that you can view, rotate, and download.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
              ⚠️ {error}
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
        )}

        {step === 'generate' && modelUrl && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">✨ Your Generated 3D Model</h4>
              <div className="flex gap-2">
                <a 
                  href={modelUrl} 
                  download 
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download GLB
                </a>
              </div>
            </div>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative shadow-lg">
              <model-viewer
                key={modelUrl}
                src={modelUrl}
                alt="Generated 3D Model"
                auto-rotate={true}
                camera-controls={true}
                ar={true}
                shadow-intensity={1}
                loading="eager"
                style={{ 
                  width: "100%", 
                  height: "500px",
                  backgroundColor: "transparent"
                }}
              />
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
                🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 AR enabled
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={fetchArtisans}
                className="bg-primary"
                disabled={loadingArtisans}
              >
                {loadingArtisans ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Artisans...
                  </>
                ) : (
                  <>
                    ✓ Use This Model & Choose Artisan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'generate' && isGenerating && (
          <div className="mt-4 flex items-center justify-center p-8 border rounded-lg bg-gray-50">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Generating your 3D model...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
