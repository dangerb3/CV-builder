import { useRef, type ChangeEvent } from 'react';
import type { Lang } from '../../types/resume';
import { fetchLocalResume } from '../../lib/bootstrap';
import { downloadJson, parseResumeFile, suggestFileName } from '../../lib/io';
import { useResumeStore } from '../../store/useResumeStore';
import { Button } from './ui';

const OTHER: Record<Lang, Lang> = { en: 'ru', ru: 'en' };

export function Toolbar({
  zoom,
  fitScale,
  onZoomChange,
}: {
  zoom: number | null;
  fitScale: number;
  onZoomChange: (zoom: number | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const lang = useResumeStore((s) => s.lang);
  const setLang = useResumeStore((s) => s.setLang);
  const copyFromLang = useResumeStore((s) => s.copyFromLang);
  const replaceFile = useResumeStore((s) => s.replaceFile);
  const resetAll = useResumeStore((s) => s.resetAll);
  const name = useResumeStore((s) => s.docs[s.lang].basics.name);

  const handleExport = () => {
    const { version, lang: current, docs } = useResumeStore.getState();
    downloadJson({ version, lang: current, docs }, suggestFileName(name));
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = parseResumeFile(await file.text());
    if (result.ok) replaceFile(result.file);
    else window.alert(`Импорт не удался: ${result.error}`);
  };

  const handleCopy = () => {
    const from = OTHER[lang];
    const ok = window.confirm(
      `Содержимое версии ${from.toUpperCase()} перезапишет текущую версию ${lang.toUpperCase()}. Продолжить?`,
    );
    if (ok) copyFromLang(from);
  };

  // Сброс возвращает к личному файлу, если он есть, — демо-резюме только как запасной вариант.
  const handleReset = async () => {
    if (!window.confirm('Сбросить обе версии к сохранённому резюме?')) return;
    resetAll();
    const local = await fetchLocalResume();
    if (local) replaceFile(local);
  };

  const percent = Math.round((zoom ?? fitScale) * 100);

  return (
    <header className="no-print flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex overflow-hidden rounded-md border border-slate-300">
        {(['en', 'ru'] as Lang[]).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase transition ${
              lang === code ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      <Button onClick={handleCopy}>Скопировать из {OTHER[lang].toUpperCase()}</Button>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <Button onClick={handleExport}>Экспорт JSON</Button>
      <Button onClick={() => fileRef.current?.click()}>Импорт JSON</Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
      <Button onClick={handleReset}>Сбросить</Button>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <div className="flex items-center gap-1">
        <Button
          aria-label="Уменьшить"
          onClick={() => onZoomChange(Math.max(0.4, (zoom ?? fitScale) - 0.1))}
        >
          −
        </Button>
        <span className="w-11 text-center text-xs text-slate-500 tabular-nums">{percent}%</span>
        <Button
          aria-label="Увеличить"
          onClick={() => onZoomChange(Math.min(1.5, (zoom ?? fitScale) + 0.1))}
        >
          +
        </Button>
        <Button onClick={() => onZoomChange(null)}>По ширине</Button>
      </div>

      <Button variant="primary" className="ml-auto" onClick={() => window.print()}>
        Скачать PDF
      </Button>
    </header>
  );
}
