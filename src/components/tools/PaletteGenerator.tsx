import React, { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { Upload, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaletteGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<number[][]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setPalette([]);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(imgRef.current, 6);
        setPalette(colors);
      } catch (err) {
        console.error("Error generating palette", err);
      }
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => 
    "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Palette Generator</h2>
        <p className="text-muted-foreground">Extract beautiful color palettes from any image.</p>
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
              ref={imgRef}
              src={imageSrc} 
              alt="Preview" 
              className="max-w-[200px] max-h-[200px] rounded-lg shadow-sm border border-border bg-white" 
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
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

      {palette.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold">Extracted Palette</h3>
          <div className="flex flex-wrap gap-4">
            {palette.map((color, i) => {
              const hex = rgbToHex(color[0], color[1], color[2]);
              const isDark = (color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114) < 128;
              
              return (
                <div 
                  key={i}
                  className="group relative flex-1 min-w-[100px] h-32 rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                  onClick={() => copyToClipboard(hex, i)}
                >
                  <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm ${isDark ? 'text-white' : 'text-black'}`}>
                    {copiedIndex === i ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </div>
                  <div className={`absolute bottom-0 w-full p-2 text-center text-xs font-medium tracking-wide ${isDark ? 'text-white/90' : 'text-black/90'} bg-black/10`}>
                    {hex.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
