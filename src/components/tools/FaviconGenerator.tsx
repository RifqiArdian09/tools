import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';

const SIZES = [16, 32, 64, 128, 180, 192, 512];

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{ filename: string, dataUrl: string, size: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setGeneratedFiles([]);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const generateFavicons = () => {
    if (!originalImage) return;
    setIsGenerating(true);
    setGeneratedFiles([]);

    setTimeout(() => {
      const files: { filename: string, dataUrl: string, size: number }[] = [];
      SIZES.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(originalImage, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/png');
          files.push({ filename: `favicon-${size}x${size}.png`, dataUrl, size });
        }
      });
      setGeneratedFiles(files);
      setIsGenerating(false);
    }, 100);
  };

  const downloadAll = () => {
    const zip = new JSZip();
    generatedFiles.forEach(file => {
      const base64Data = file.dataUrl.split(',')[1];
      zip.file(file.filename, base64Data, { base64: true });
    });

    const size32 = generatedFiles.find(f => f.size === 32);
    if (size32) {
      zip.file('favicon.ico', size32.dataUrl.split(',')[1], { base64: true });
    }

    let htmlSnippet = "<!-- Add the following lines inside your <head> tag -->\n";
    SIZES.forEach(size => {
      htmlSnippet += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">\n`;
    });
    zip.file('instructions.html', htmlSnippet);

    zip.generateAsync({ type: "blob" }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'favicons.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Favicon Generator</h2>
        <p className="text-muted-foreground">Upload an image and generate standard favicon sizes instantly.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
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
          accept="image/png, image/jpeg, image/svg+xml, image/webp" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        {imageSrc ? (
          <div className="flex flex-col items-center gap-4">
            <img src={imageSrc} alt="Preview" className="max-w-[150px] max-h-[150px] rounded-lg shadow-sm border border-border bg-white" />
            <p className="text-sm text-muted-foreground">Click or drop to replace image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-4 rounded-full bg-background border border-border shadow-sm">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Click or Drag & Drop Image Here</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, SVG, WebP</p>
            </div>
          </div>
        )}
      </div>

      <Button 
        size="lg" 
        onClick={generateFavicons} 
        disabled={!originalImage || isGenerating}
        className="w-full sm:w-auto self-center"
      >
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isGenerating ? 'Generating...' : 'Generate Favicons'}
      </Button>

      {generatedFiles.length > 0 && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-xl font-semibold">Generated Files</h3>
            <Button variant="secondary" onClick={downloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {generatedFiles.map((file, i) => (
              <Card key={i} className="overflow-hidden bg-background">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
                  <div className="bg-white/10 p-2 rounded-md border border-border/50">
                    <img 
                      src={file.dataUrl} 
                      style={{ width: Math.min(file.size, 64), height: Math.min(file.size, 64) }} 
                      className="bg-transparent"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{file.size}x{file.size}</p>
                    <a href={file.dataUrl} download={file.filename} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Download
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
