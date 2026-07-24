import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';

export default function QrGenerator() {
  const [value, setValue] = useState('https://example.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qrcode.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">QR Code Generator</h2>
          <p className="text-muted-foreground">Create customizable QR codes instantly.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-content">Content (URL, Text, etc)</Label>
            <Input 
              id="qr-content" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-size">Size (px)</Label>
            <Input 
              id="qr-size" 
              type="number" 
              value={size} 
              onChange={(e) => setSize(Number(e.target.value))} 
              min={128}
              max={1024}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-fg">Foreground Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  id="qr-fg" 
                  value={fgColor} 
                  onChange={(e) => setFgColor(e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-bg">Background Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  id="qr-bg" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 bg-muted/20 p-8 rounded-xl border border-border">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
          <QRCodeSVG
            value={value || ' '}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
            includeMargin={false}
            ref={svgRef}
            style={{ width: '100%', height: 'auto', maxWidth: '256px' }}
          />
        </div>
        <Button onClick={downloadQR} className="w-full" disabled={!value}>
          <Download className="w-4 h-4 mr-2" />
          Download SVG
        </Button>
      </div>
    </div>
  );
}
