import { useEffect, useState } from 'react';
import { BasicsEditor } from './components/editor/BasicsEditor';
import { SectionsEditor } from './components/editor/SectionsEditor';
import { Toolbar, type View } from './components/editor/Toolbar';
import { A4Preview } from './components/preview/A4Preview';
import { useResumeStore } from './store/useResumeStore';

/** Граница, ниже которой редактор и лист не помещаются рядом. Совпадает с `lg` у Tailwind. */
const DESKTOP = '(min-width: 1024px)';

function useDesktop(): boolean {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

export default function App() {
  const lang = useResumeStore((s) => s.lang);
  const doc = useResumeStore((s) => s.docs[s.lang]);
  const [zoom, setZoom] = useState<number | null>(null);
  const [fitScale, setFitScale] = useState(0.7);
  const [view, setView] = useState<View>('edit');
  const desktop = useDesktop();

  /*
   * Ниже lg показываем ровно одну панель. Прятать её обычным `hidden` нельзя:
   * при печати из режима «Редактор» лист ушёл бы в display:none и в PDF попала
   * бы пустая страница, — поэтому `pane-off`, который на бумаге всё возвращает.
   */
  const hideEditor = !desktop && view === 'preview';
  const hidePreview = !desktop && view === 'edit';

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        view={view}
        zoom={zoom}
        fitScale={fitScale}
        onViewChange={setView}
        onZoomChange={setZoom}
      />

      <div className="flex min-h-0 flex-1">
        <aside
          className={`no-print w-full shrink-0 space-y-4 overflow-y-auto border-r border-slate-200 bg-slate-50 p-3 lg:w-[440px] lg:p-4 ${
            hideEditor ? 'pane-off' : ''
          }`}
        >
          <BasicsEditor basics={doc.basics} />
          <SectionsEditor doc={doc} />
        </aside>

        <main className={`min-w-0 flex-1 ${hidePreview ? 'pane-off' : ''}`}>
          {/* Ручной зум — десктопная вещь: на узком экране лист всегда вписан по ширине. */}
          <A4Preview
            doc={doc}
            lang={lang}
            zoom={desktop ? zoom : null}
            hidden={hidePreview}
            onFitScale={setFitScale}
          />
        </main>
      </div>
    </div>
  );
}
