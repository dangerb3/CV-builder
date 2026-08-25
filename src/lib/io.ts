import type { Lang, ResumeDoc, ResumeFile } from '../types/resume';

export type ParseResult =
  | { ok: true; file: ResumeFile }
  | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isDoc = (v: unknown): v is ResumeDoc =>
  isObject(v) && isObject(v.basics) && Array.isArray(v.sections);

/**
 * Разбирает JSON, сохранённый кнопкой «Экспорт».
 * Файл — это единственный формат, в котором резюме живёт вне браузера,
 * поэтому проверяем структуру явно, а не доверяем ей на слово.
 */
export function parseResumeFile(raw: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Файл не является корректным JSON' };
  }

  if (!isObject(data)) return { ok: false, error: 'Ожидался объект резюме' };
  if (data.version !== 1) return { ok: false, error: 'Неподдерживаемая версия формата' };
  if (data.lang !== 'en' && data.lang !== 'ru') {
    return { ok: false, error: 'Некорректный язык документа' };
  }
  if (!isObject(data.docs) || !isDoc(data.docs.en) || !isDoc(data.docs.ru)) {
    return { ok: false, error: 'В файле нет обеих языковых версий (en и ru)' };
  }

  return {
    ok: true,
    file: {
      version: 1,
      lang: data.lang as Lang,
      docs: { en: data.docs.en, ru: data.docs.ru },
    },
  };
}

export const serializeResumeFile = (file: ResumeFile): string =>
  JSON.stringify(file, null, 2);

/** Имя файла вида «resume-alex-morgan-2026-08-26.json». */
export function suggestFileName(name: string): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'resume';
  return `resume-${slug}-${localDate()}.json`;
}

/**
 * Дата по местному времени. toISOString() отдаёт UTC, из-за чего вечерний
 * экспорт восточнее Гринвича получал вчерашнее число.
 */
function localDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function downloadJson(file: ResumeFile, fileName: string): void {
  const blob = new Blob([serializeResumeFile(file)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Читает выбранное изображение как data-URL, чтобы оно попало в JSON. */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'));
    reader.readAsDataURL(file);
  });
}
