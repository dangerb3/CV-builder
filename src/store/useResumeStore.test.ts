import { beforeEach, describe, expect, it } from 'vitest';
import { columnSections, initialFile, useResumeStore } from './useResumeStore';
import type { Section } from '../types/resume';

const state = () => useResumeStore.getState();
const doc = () => state().docs[state().lang];
const find = (id: string): Section | undefined =>
  doc().sections.find((s) => s.id === id);

beforeEach(() => {
  useResumeStore.setState(initialFile());
});

describe('секции', () => {
  it('переносит секцию в другую колонку и ставит её на место цели', () => {
    expect(find('s-skills')?.column).toBe('right');

    state().moveSection('s-skills', 's-experience');

    expect(find('s-skills')?.column).toBe('left');
    expect(columnSections(doc(), 'left').map((s) => s.id)).toEqual([
      's-skills',
      's-experience',
    ]);
  });

  it('бросок на пустую колонку отправляет секцию в её конец', () => {
    state().moveSection('s-experience', 'column:right');

    expect(columnSections(doc(), 'left')).toHaveLength(0);
    expect(columnSections(doc(), 'right').at(-1)?.id).toBe('s-experience');
  });

  it('переставляет секции внутри одной колонки', () => {
    state().moveSection('s-education', 's-skills');

    expect(columnSections(doc(), 'right').map((s) => s.id)).toEqual([
      's-education',
      's-skills',
      's-projects',
    ]);
  });

  it('скрытая секция остаётся в документе', () => {
    state().updateSection('s-skills', { visible: false });

    expect(find('s-skills')?.visible).toBe(false);
    expect(columnSections(doc(), 'right')).toHaveLength(3);
  });

  it('переключает флаги оформления, не трогая остальное', () => {
    expect(find('s-education')?.divider).toBeUndefined();

    state().updateSection('s-education', { divider: true, periodInline: true });

    const section = find('s-education');
    expect(section?.divider).toBe(true);
    expect(section?.periodInline).toBe(true);
    expect(section?.bulletStyle).toBeUndefined();
    expect(section?.title).toBe('Education');
  });

  it('добавляет и удаляет секции', () => {
    state().addSection('text', 'Languages');
    const added = doc().sections.at(-1)!;
    expect(added.type).toBe('text');

    state().removeSection(added.id);
    expect(doc().sections.find((s) => s.id === added.id)).toBeUndefined();
  });
});

describe('записи внутри секции', () => {
  it('переставляет места работы', () => {
    state().moveItem('s-experience', 'e-2', 'e-1');

    const section = find('s-experience');
    expect(section?.type === 'experience' && section.items.map((i) => i.id)).toEqual([
      'e-2',
      'e-1',
    ]);
  });

  it('правит поля записи и её буллеты', () => {
    state().updateItem('s-experience', 'e-1', { role: 'Lead Frontend' });
    state().setBullets('s-experience', 'e-1', ['Один', 'Два']);

    const section = find('s-experience');
    if (section?.type !== 'experience') throw new Error('ожидалась секция опыта');
    expect(section.items[0].role).toBe('Lead Frontend');
    expect(section.items[0].bullets).toEqual(['Один', 'Два']);
  });

  it('добавляет навык с введённым именем', () => {
    state().addSkill('s-skills', 'Vitest');

    const section = find('s-skills');
    expect(section?.type === 'skills' && section.items.at(-1)?.name).toBe('Vitest');
  });
});

describe('языковые версии', () => {
  it('правки одной версии не задевают другую', () => {
    state().updateBasics({ name: 'Changed EN' });
    state().setLang('ru');

    expect(doc().basics.name).not.toBe('Changed EN');
    expect(state().docs.en.basics.name).toBe('Changed EN');
  });

  it('копирование из EN переносит структуру в RU', () => {
    state().setLang('ru');
    expect(columnSections(doc(), 'left')[0]?.type).toBe('experience');

    state().copyFromLang('en');

    const experience = find('s-experience');
    expect(experience?.type === 'experience' && experience.items).toHaveLength(2);
    expect(state().docs.en.basics.name).toBe('Alex Morgan');
  });

  it('копирование из самой себя ничего не делает', () => {
    state().updateBasics({ name: 'Sole source' });
    state().copyFromLang('en');

    expect(doc().basics.name).toBe('Sole source');
  });
});
