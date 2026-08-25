import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLocalResume } from './bootstrap';
import { serializeResumeFile } from './io';
import { initialFile } from '../store/useResumeStore';

/** Ответ вида, который отдал бы дев-сервер или продакшн-сборка. */
const respond = (body: string, init: { status?: number; type?: string } = {}) =>
  new Response(body, {
    status: init.status ?? 200,
    headers: { 'content-type': init.type ?? 'application/json' },
  });

const stubFetch = (impl: () => Promise<Response>) => vi.stubGlobal('fetch', impl);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchLocalResume', () => {
  it('возвращает разобранный файл, когда он на месте', async () => {
    const file = initialFile();
    stubFetch(async () => respond(serializeResumeFile(file)));

    await expect(fetchLocalResume()).resolves.toEqual(file);
  });

  it('не принимает index.html, которым Vite подменяет отсутствующий файл', async () => {
    // Дев-сервер отвечает на несуществующий путь страницей приложения со
    // статусом 200 — без проверки content-type мы бы скормили её парсеру.
    stubFetch(async () => respond('<!doctype html><html></html>', { type: 'text/html' }));

    await expect(fetchLocalResume()).resolves.toBeNull();
  });

  it('возвращает null на 404', async () => {
    stubFetch(async () => respond('Not found', { status: 404, type: 'text/plain' }));

    await expect(fetchLocalResume()).resolves.toBeNull();
  });

  it('переживает обрыв сети', async () => {
    stubFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    await expect(fetchLocalResume()).resolves.toBeNull();
  });

  it('не падает на повреждённом файле, но предупреждает в консоли', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubFetch(async () => respond('{"version": 99}'));

    await expect(fetchLocalResume()).resolves.toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });
});
