import { useRef, type ChangeEvent, type ReactNode } from 'react';
import type { Lang } from '../../types/resume';
import { fetchLocalResume } from '../../lib/bootstrap';
import { downloadJson, parseResumeFile, suggestFileName } from '../../lib/io';
import { useResumeStore } from '../../store/useResumeStore';
import { Button, Menu, MenuItem } from './ui';

export type View = 'edit' | 'preview';

const OTHER: Record<Lang, Lang> = { en: 'ru', ru: 'en' };

/** Переключатель из нескольких кнопок в одной рамке. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-300">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs font-semibold uppercase transition ${
            value === option.value
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toolbar({
  view,
  zoom,
  fitScale,
  onViewChange,
  onZoomChange,
}: {
  view: View;
  zoom: number | null;
  fitScale: number;
  onViewChange: (view: View) => void;
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
  const copyLabel = `Скопировать из ${OTHER[lang].toUpperCase()}`;

  return (
    <header className="no-print flex flex-nowrap items-center gap-2 border-b border-slate-200 bg-white px-2 py-2 lg:flex-wrap lg:px-4 lg:py-2.5">
      <Segmented
        value={lang}
        onChange={setLang}
        options={[
          { value: 'en', label: 'en' },
          { value: 'ru', label: 'ru' },
        ]}
      />

      {/* Ниже lg панели не помещаются рядом, поэтому видна ровно одна. */}
      <div className="lg:hidden">
        <Segmented
          value={view}
          onChange={onViewChange}
          options={[
            { value: 'edit', label: 'Редактор' },
            { value: 'preview', label: 'Превью' },
          ]}
        />
      </div>

      <div className="lg:hidden">
        <Menu ariaLabel="Ещё действия" label="⋮">
          {(close) => (
            <>
              <MenuItem onClick={() => { close(); handleCopy(); }}>{copyLabel}</MenuItem>
              <MenuItem onClick={() => { close(); handleExport(); }}>Экспорт JSON</MenuItem>
              <MenuItem onClick={() => { close(); fileRef.current?.click(); }}>
                Импорт JSON
              </MenuItem>
              <MenuItem onClick={() => { close(); void handleReset(); }}>Сбросить</MenuItem>
            </>
          )}
        </Menu>
      </div>

      <div className="hidden items-center gap-2 lg:flex lg:flex-wrap">
        <Button onClick={handleCopy}>{copyLabel}</Button>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <Button onClick={handleExport}>Экспорт JSON</Button>
        <Button onClick={() => fileRef.current?.click()}>Импорт JSON</Button>
        <Button onClick={handleReset}>Сбросить</Button>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        {/* Зум — только для десктопа: на узком экране лист всегда вписан по ширине. */}
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
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />

      <Button variant="primary" className="ml-auto shrink-0" onClick={() => window.print()}>
        <span className="lg:hidden">PDF</span>
        <span className="hidden lg:inline">Скачать PDF</span>
      </Button>
    </header>
  );
}
