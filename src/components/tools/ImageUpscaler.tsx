import React, { useState, useRef } from 'react';
import Upscaler from 'upscaler';
import { Upload, Download, Loader2, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ImageUpscaler() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [scale, setScale] = useState<number>(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const processImage = async () => {
    if (!imageSrc) return;
    
    setIsProcessing(true);
    setProgress('Initializing AI Model...');
    
    try {
      // Upscaler handles models automatically. Default is usually good for general x2/x4.
      const upscaler = new Upscaler();
      
      const upscaledImage = await upscaler.upscale(imageSrc, {
        patchSize: 64,
        padding: 2,
        progress: (amount) => {
          setProgress(`Upscaling: ${Math.round(amount * 100)}%`);
        }
      });
      
      setResultImage(upscaledImage);
    } catch (err) {
      console.error(err);
      alert("Error upscaling image. Check console.");
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Image Upscaler</h2>
        <p className="text-muted-foreground">Upscale your images by 2x or 4x locally using AI models in your browser.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Original</h3>
          <div 
            className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              imageSrc ? 'border-border bg-card' : 'border-muted-foreground/30 hover:border-primary bg-muted/10 hover:bg-muted/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
            
            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt="Preview" 
                className="max-w-full max-h-full p-2 rounded-lg object-contain" 
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-sm">Upload Image</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={processImage} 
            disabled={!imageSrc || isProcessing}
            className="w-full"
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
            {isProcessing ? progress || 'Processing...' : 'Upscale x2'}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Result</h3>
          <div className="h-64 border rounded-xl flex flex-col items-center justify-center overflow-hidden relative shadow-inner bg-muted/10">
            {resultImage ? (
              <img 
                src={resultImage} 
                alt="Result" 
                className="max-w-full max-h-full object-contain p-2" 
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">No result yet</p>
            )}
          </div>

          <Button 
            variant="secondary"
            onClick={() => {
              if (!resultImage) return;
              const link = document.createElement('a');
              link.href = resultImage;
              link.download = 'upscaled.png';
              link.click();
            }} 
            disabled={!resultImage}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Upscaled Image
          </Button>
        </div>
      </div>
    </div>
  );
}
