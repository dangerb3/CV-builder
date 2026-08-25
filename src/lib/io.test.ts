import { describe, expect, it } from 'vitest';
import { parseResumeFile, serializeResumeFile, suggestFileName } from './io';
import { initialFile } from '../store/useResumeStore';

describe('parseResumeFile', () => {
  it('переживает круг экспорт → импорт без потерь', () => {
    const file = initialFile();
    const result = parseResumeFile(serializeResumeFile(file));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.file).toEqual(file);
  });

  it('отвергает не-JSON', () => {
    const result = parseResumeFile('не json');
    expect(result).toEqual({ ok: false, error: 'Файл не является корректным JSON' });
  });

  it('отвергает чужую версию формата', () => {
    const result = parseResumeFile(JSON.stringify({ version: 99, lang: 'en', docs: {} }));
    expect(result.ok).toBe(false);
  });

  it('отвергает файл без одной из языковых версий', () => {
    const file = initialFile();
    const broken = JSON.stringify({ ...file, docs: { en: file.docs.en } });

    const result = parseResumeFile(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('обеих языковых версий');
  });
});

describe('suggestFileName', () => {
  it('делает slug из имени и ставит сегодняшнюю дату по местному времени', () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    expect(suggestFileName('Alex Morgan')).toBe(
      `resume-alex-morgan-${now.getFullYear()}-${month}-${day}.json`,
    );
  });

  it('подставляет запасное имя, если поле пустое', () => {
    expect(suggestFileName('   ')).toMatch(/^resume-resume-/);
  });
});
