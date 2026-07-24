import React, { useState, useRef } from 'react';
import { Upload, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const FORMATS = [
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' }
];

export default function ImageConverter() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [filename, setFilename] = useState('converted');
  const [targetFormat, setTargetFormat] = useState(FORMATS[0].value);
  const [quality, setQuality] = useState(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Set default filename without extension
    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    setFilename(nameWithoutExt || 'converted');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
      const img = new Image();
      img.onload = () => setOriginalImage(img);
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

  const convertAndDownload = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background for JPGs (since PNGs might have transparency)
    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0);

    const dataUrl = canvas.toDataURL(targetFormat, quality / 100);
    const ext = FORMATS.find(f => f.value === targetFormat)?.label.toLowerCase() || 'jpg';
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Image Converter</h2>
        <p className="text-muted-foreground">Convert images between JPG, PNG, and WebP instantly.</p>
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
          accept="image/*" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        {imageSrc ? (
          <div className="flex flex-col items-center gap-4">
            <img 
              src={imageSrc} 
              alt="Preview" 
              className="max-w-[200px] max-h-[200px] rounded-lg shadow-sm border border-border bg-white" 
            />
            <p className="text-sm text-muted-foreground">Click or drop to replace image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-4 rounded-full bg-background border border-border shadow-sm">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Click or Drag & Drop Image Here</p>
            </div>
          </div>
        )}
      </div>

      {imageSrc && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>Convert To</Label>
              <div className="flex gap-2">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt.value}
                    onClick={() => setTargetFormat(fmt.value)}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                      targetFormat === fmt.value 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
              <div className="flex-1 space-y-2 w-full">
                <Label>Quality ({quality}%)</Label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </div>

          <Button 
            size="lg" 
            onClick={convertAndDownload} 
            className="w-full"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert & Download
          </Button>
        </div>
      )}
    </div>
  );
}
