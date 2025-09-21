import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGenerateDesign } from '@/hooks/useAI';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DesignGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDesignGenerated?: (result: any) => void;
}

export function DesignGenerationModal({ isOpen, onClose, onDesignGenerated }: DesignGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('traditional');
  const [category, setCategory] = useState('Art');
  
  const generateDesignMutation = useGenerateDesign();

  const styles = [
    'traditional',
    'modern',
    'fusion',
    'minimalist',
    'ornate',
    'rustic',
    'contemporary'
  ];

  const categories = [
    'Ceramics',
    'Furniture',
    'Textiles',
    'Leather Goods',
    'Glass Art',
    'Kitchenware',
    'Jewelry',
    'Home Decor',
    'Clothing',
    'Art'
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    try {
      const result = await generateDesignMutation.mutateAsync({
        prompt,
        style,
        category
      });

      if (result.success) {
        // Pass the result to parent component
        onDesignGenerated?.(result.data);
        // Close modal and clear form
        onClose();
        setPrompt('');
      }
    } catch (error) {
      console.error('Design generation error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Design Generator
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Powered by Gemini
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Design Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your custom craft idea in detail... e.g., 'A beautiful handmade ceramic vase with blue floral patterns, medium size, suitable for home decoration'"
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
              🤖 <strong>Powered by Google Gemini AI:</strong> Describe your vision in detail! 
              Our AI understands materials, styles, sizes, and crafting techniques to generate 
              professional design concepts and match you with skilled artisans.
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={generateDesignMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={generateDesignMutation.isPending || !prompt.trim()}
            >
              {generateDesignMutation.isPending ? (
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
      </DialogContent>
    </Dialog>
  );
}