import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import TurndownService from 'turndown';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, FileText, Copy, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Setup pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export default function DocToMarkdown() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setMarkdown('');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setMarkdown('');

    try {
      let mdResult = '';
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const turndownService = new TurndownService();
        mdResult = turndownService.turndown(result.value);
      } 
      else if (extension === 'xlsx' || extension === 'csv') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(firstSheet);
        
        // Convert CSV to Markdown table
        const rows = csv.split('\n').filter(row => row.trim().length > 0);
        if (rows.length > 0) {
          const header = rows[0].split(',').map(cell => cell.trim()).join(' | ');
          const separator = rows[0].split(',').map(() => '---').join(' | ');
          const body = rows.slice(1).map(row => row.split(',').map(cell => cell.trim()).join(' | ')).join('\n');
          mdResult = `| ${header} |\n| ${separator} |\n${body.split('\n').map(row => `| ${row} |`).join('\n')}`;
        }
      }
      else if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          text += strings.join(' ') + '\n\n';
        }
        mdResult = text; // PDF parsing to pure markdown is limited without structure
      }
      else {
        mdResult = 'Unsupported file format. Please upload DOCX, XLSX, or PDF.';
      }

      setMarkdown(mdResult);
    } catch (err) {
      console.error(err);
      setMarkdown('Error processing file. See console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 h-[calc(100vh-100px)]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Document to Markdown</h2>
        <p className="text-muted-foreground">Convert DOCX, XLSX, and PDF files to Markdown instantly in your browser.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              file ? 'border-border bg-card' : 'border-muted-foreground/30 hover:border-primary bg-muted/10 hover:bg-muted/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept=".docx,.xlsx,.csv,.pdf" 
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <FileText className="w-10 h-10 text-primary" />
                <p className="font-medium text-sm break-all">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-sm">Upload File</p>
                <p className="text-xs text-muted-foreground mt-1">DOCX, XLSX, PDF</p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={processFile} 
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {isProcessing ? 'Converting...' : 'Convert to Markdown'}
          </Button>
        </div>

        <div className="flex-1 border rounded-xl bg-card overflow-hidden flex flex-col shadow-inner">
          <div className="border-b bg-muted/50 p-2 flex justify-between items-center">
            <span className="text-sm font-medium px-2">Markdown Output</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigator.clipboard.writeText(markdown)}
                disabled={!markdown}
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  const blob = new Blob([markdown], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${file?.name.split('.')[0] || 'converted'}.md`;
                  a.click();
                }}
                disabled={!markdown}
              >
                <Download className="w-4 h-4 mr-2" /> Save .md
              </Button>
            </div>
          </div>
          <textarea 
            className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-sm"
            value={markdown}
            readOnly
            placeholder="Converted markdown will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
