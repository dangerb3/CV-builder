import type { ResumeFile } from '../types/resume';
import { STORAGE_KEY, useResumeStore } from '../store/useResumeStore';
import { parseResumeFile } from './io';

/** Файл лежит в `public/`, поэтому доступен и в дев-режиме, и в сборке. */
export const LOCAL_RESUME_URL = '/resume.local.json';

/**
 * Читает личное резюме из `public/resume.local.json` — файла, который
 * перечислен в .gitignore и потому не уезжает в репозиторий.
 *
 * Возвращает null, если файла нет или он повреждён: демо-резюме в этом случае
 * лучше пустого экрана.
 */
export async function fetchLocalResume(): Promise<ResumeFile | null> {
  let response: Response;
  try {
    response = await fetch(LOCAL_RESUME_URL, { cache: 'no-store' });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  // На отсутствующий файл дев-сервер Vite отвечает index.html со статусом 200,
  // поэтому одного response.ok мало — проверяем тип содержимого.
  if (!response.headers.get('content-type')?.includes('json')) return null;

  const parsed = parseResumeFile(await response.text());
  if (!parsed.ok) {
    console.warn(`${LOCAL_RESUME_URL}: ${parsed.error}. Открыто демо-резюме.`);
    return null;
  }

  return parsed.file;
}

export type ResumeSource = 'storage' | 'local-file' | 'sample';

/**
 * Стартовая загрузка. Порядок приоритетов: собственные правки в localStorage,
 * затем личный файл, затем демо-резюме из репозитория.
 */
export async function loadInitialResume(): Promise<ResumeSource> {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Приватный режим или запрет на хранение — просто идём дальше.
  }
  if (saved) return 'storage';

  const local = await fetchLocalResume();
  if (!local) return 'sample';

  useResumeStore.getState().replaceFile(local);
  return 'local-file';
}
