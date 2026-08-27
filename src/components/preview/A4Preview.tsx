import { useLayoutEffect, useRef, useState } from 'react';
import type { ResumeDoc, Lang } from '../../types/resume';
import { templateLabels } from '../../i18n/labels';
import { NovoTemplate } from '../../templates/novo/NovoTemplate';

/** Размеры листа A4 в CSS-пикселях при 96 dpi — в них же браузер печатает. */
const PAGE_WIDTH = (210 / 25.4) * 96;
const PAGE_HEIGHT = (297 / 25.4) * 96;

const toMm = (px: number): number => Math.round((px / 96) * 25.4);

/**
 * Лист резюме, вписанный в доступную ширину через CSS-трансформацию.
 * Масштаб — чисто экранная вещь: при печати он сбрасывается, и на бумагу
 * уходит лист в натуральную величину.
 *
 * Поверх листа рисуются границы страниц. Без них лист выглядит бесконечным,
 * и то, что содержимое перелезло на второй лист, обнаруживалось только в
 * готовом PDF.
 */
export function A4Preview({
  doc,
  lang,
  zoom,
  hidden,
  onFitScale,
}: {
  doc: ResumeDoc;
  lang: Lang;
  /** null — вписать по ширине контейнера. */
  zoom: number | null;
  /** Панель убрана с экрана (узкий экран, открыт редактор). */
  hidden: boolean;
  onFitScale: (scale: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.7);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const page = pageRef.current;
    if (!frame || !page) return;

    const measure = () => {
      // У скрытой панели ширина нулевая — масштаб бы схлопнулся в ноль.
      if (frame.clientWidth === 0) return;

      // Падинг рамки зависит от брейкпоинта, поэтому берём фактический.
      const style = getComputedStyle(frame);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = frame.clientWidth - padding;
      const scale = Math.min(1, available / PAGE_WIDTH);
      setFit(scale);
      onFitScale(scale);
      // offsetHeight не зависит от transform — берём высоту листа в натуральную величину.
      setSheetHeight(page.offsetHeight);

      /*
       * Считать страницы по высоте листа нельзя: на экране его растягивает
       * min-height в 297 мм, а при печати это правило снято. Считаем по низу
       * содержимого — offsetTop обоих элементов отсчитывается от одного
       * предка, поэтому их разность даёт высоту без учёта масштаба.
       */
      const sheet = page.querySelector<HTMLElement>('.a4');
      const body = page.querySelector<HTMLElement>('.novo-body');
      setContentHeight(
        sheet && body ? body.offsetTop - sheet.offsetTop + body.offsetHeight : page.offsetHeight,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(page);
    return () => observer.disconnect();
    /*
     * `hidden` в зависимостях — не декорация: на возвращении панели из
     * display:none ResizeObserver сам не срабатывает, и лист остался бы в
     * масштабе, посчитанном для другой ширины (или в начальном 0.7).
     */
  }, [zoom, hidden, onFitScale]);

  const scale = zoom ?? fit;
  /** offsetHeight округляется до целых, а 297 мм — это 1122.5 px. */
  const ROUNDING = 2;
  const pages = Math.max(1, Math.ceil((contentHeight - ROUNDING) / PAGE_HEIGHT));
  /** Насколько содержимое вылезло за последнюю целую страницу. */
  const overflow = contentHeight - (pages - 1) * PAGE_HEIGHT;

  return (
    <div ref={frameRef} className="preview-scroll h-full overflow-auto bg-slate-200 p-3 sm:p-6">
      <div className="no-print mx-auto mb-3 flex justify-center" style={{ width: PAGE_WIDTH * scale }}>
        {pages === 1 ? (
          <span className="max-w-full rounded-full bg-emerald-100 px-3 py-1 text-center text-xs font-medium text-emerald-800">
            Помещается на одну страницу
          </span>
        ) : (
          <span className="max-w-full rounded-full bg-amber-100 px-3 py-1 text-center text-xs font-medium text-amber-900">
            {pages} страницы — за край первой уходит {toMm(overflow)} мм
          </span>
        )}
      </div>

      <div
        className="preview-frame mx-auto"
        style={{ width: PAGE_WIDTH * scale, height: sheetHeight * scale }}
      >
        <div
          ref={pageRef}
          className="preview-zoom relative"
          style={{ width: PAGE_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <NovoTemplate doc={doc} labels={templateLabels[lang]} />

          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              className="no-print pointer-events-none absolute right-0 left-0 border-t-2 border-dashed border-red-400/70"
              style={{ top: (i + 1) * PAGE_HEIGHT }}
            >
              <span className="absolute right-0 -top-5 bg-red-400/90 px-1.5 py-0.5 text-[10px] text-white">
                конец страницы {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
