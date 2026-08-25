import { useState } from 'react';
import { BasicsEditor } from './components/editor/BasicsEditor';
import { SectionsEditor } from './components/editor/SectionsEditor';
import { Toolbar } from './components/editor/Toolbar';
import { A4Preview } from './components/preview/A4Preview';
import { useResumeStore } from './store/useResumeStore';

export default function App() {
  const lang = useResumeStore((s) => s.lang);
  const doc = useResumeStore((s) => s.docs[s.lang]);
  const [zoom, setZoom] = useState<number | null>(null);
  const [fitScale, setFitScale] = useState(0.7);

  return (
    <div className="flex h-full flex-col">
      <Toolbar zoom={zoom} fitScale={fitScale} onZoomChange={setZoom} />

      <div className="flex min-h-0 flex-1">
        <aside className="no-print w-[440px] shrink-0 space-y-4 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
          <BasicsEditor basics={doc.basics} />
          <SectionsEditor doc={doc} />
        </aside>

        <main className="min-w-0 flex-1">
          <A4Preview doc={doc} lang={lang} zoom={zoom} onFitScale={setFitScale} />
        </main>
      </div>
    </div>
  );
}
