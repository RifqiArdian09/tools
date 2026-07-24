import { useState } from 'react'
import {
  Wrench,
  Image as ImageIcon,
  QrCode,
  Scissors,
  FileText,
  Palette,
  Maximize
} from 'lucide-react'

import FaviconGenerator from './components/tools/FaviconGenerator'
import QrGenerator from './components/tools/QrGenerator'
import PaletteGenerator from './components/tools/PaletteGenerator'
import ImageConverter from './components/tools/ImageConverter'
import BackgroundRemover from './components/tools/BackgroundRemover'
import ImageUpscaler from './components/tools/ImageUpscaler'
import DocToMarkdown from './components/tools/DocToMarkdown'

const tools = [
  { id: 'favicon', name: 'Favicon Generator', icon: Wrench, component: FaviconGenerator },
  { id: 'upscaler', name: 'Image Upscaler', icon: Maximize, component: ImageUpscaler },
  { id: 'qr', name: 'QR Code Generator', icon: QrCode, component: QrGenerator },
  { id: 'bg-remove', name: 'Background Remover', icon: Scissors, component: BackgroundRemover },
  { id: 'img-convert', name: 'Image Converter', icon: ImageIcon, component: ImageConverter },
  { id: 'doc-md', name: 'Doc to Markdown', icon: FileText, component: DocToMarkdown },
  { id: 'palette', name: 'Palette Generator', icon: Palette, component: PaletteGenerator },
]

function App() {
  const [activeTool, setActiveTool] = useState(tools[0].id)

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component || FaviconGenerator

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold tracking-tight">SuperTools</h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-purpose utilities</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {tools.map(tool => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                {tool.name}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center px-6">
          <h2 className="text-lg font-semibold">
            {tools.find(t => t.id === activeTool)?.name}
          </h2>
        </header>
        <div className="flex-1 overflow-auto bg-muted/20 p-6">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-sm min-h-[500px]">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
