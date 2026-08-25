import { current } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Basics,
  Column,
  Contact,
  ContactKind,
  Lang,
  ResumeDoc,
  ResumeFile,
  Section,
  SectionType,
} from '../types/resume';
import { defaultResumeEn } from '../data/defaultResume.en';
import { defaultResumeRu } from '../data/defaultResume.ru';
import {
  emptyEducation,
  emptyExperience,
  emptyProject,
  emptySection,
  emptySkill,
  uid,
} from '../lib/factories';

export const STORAGE_KEY = 'resume-builder:v1';

const COLUMN_PREFIX = 'column:';

/** Начальное состояние: EN заполнен из PDF, RU — каркас. */
export const initialFile = (): ResumeFile => ({
  version: 1,
  lang: 'en',
  docs: {
    en: structuredClone(defaultResumeEn),
    ru: structuredClone(defaultResumeRu),
  },
});

interface Actions {
  setLang: (lang: Lang) => void;
  replaceFile: (file: ResumeFile) => void;
  resetAll: () => void;
  /** Переносит содержимое другой языковой версии поверх текущей. */
  copyFromLang: (from: Lang) => void;

  updateBasics: (patch: Partial<Basics>) => void;
  addContact: (kind: ContactKind) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  removeContact: (id: string) => void;

  addSection: (type: SectionType, title: string) => void;
  updateSection: (
    id: string,
    patch: Partial<
      Pick<Section, 'title' | 'visible' | 'column' | 'divider' | 'periodInline' | 'bulletStyle'>
    >,
  ) => void;
  removeSection: (id: string) => void;
  /** overId — id другой секции или 'column:left' / 'column:right'. */
  moveSection: (activeId: string, overId: string) => void;

  addItem: (sectionId: string) => void;
  /** Навык добавляется сразу с текстом — его вводят в отдельном поле. */
  addSkill: (sectionId: string, name: string) => void;
  updateItem: (sectionId: string, itemId: string, patch: object) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  moveItem: (sectionId: string, activeId: string, overId: string) => void;

  setBullets: (sectionId: string, itemId: string, bullets: string[]) => void;
  setTextBody: (sectionId: string, body: string) => void;
}

export type ResumeStore = ResumeFile & Actions;

const move = <T,>(list: T[], from: number, to: number): void => {
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    immer<ResumeStore>((set) => {
      /** Все правки идут в документ текущего языка. */
      const doc = (state: ResumeStore): ResumeDoc => state.docs[state.lang];

      const section = (state: ResumeStore, id: string): Section | undefined =>
        doc(state).sections.find((s) => s.id === id);

      return {
        ...initialFile(),

        setLang: (lang) =>
          set((s) => {
            s.lang = lang;
          }),

        replaceFile: (file) =>
          set((s) => {
            s.version = file.version;
            s.lang = file.lang;
            s.docs = file.docs;
          }),

        resetAll: () => set(() => initialFile()),

        copyFromLang: (from) =>
          set((s) => {
            if (from === s.lang) return;
            // current() снимает с черновика immer обычный объект —
            // структурное клонирование прокси падает с DataCloneError.
            s.docs[s.lang] = structuredClone(current(s.docs[from]));
          }),

        updateBasics: (patch) =>
          set((s) => {
            Object.assign(doc(s).basics, patch);
          }),

        addContact: (kind) =>
          set((s) => {
            doc(s).basics.contacts.push({ id: uid('c'), kind, value: '' });
          }),

        updateContact: (id, patch) =>
          set((s) => {
            const contact = doc(s).basics.contacts.find((c) => c.id === id);
            if (contact) Object.assign(contact, patch);
          }),

        removeContact: (id) =>
          set((s) => {
            const contacts = doc(s).basics.contacts;
            const i = contacts.findIndex((c) => c.id === id);
            if (i !== -1) contacts.splice(i, 1);
          }),

        addSection: (type, title) =>
          set((s) => {
            doc(s).sections.push(emptySection(type, title));
          }),

        updateSection: (id, patch) =>
          set((s) => {
            const target = section(s, id);
            if (target) Object.assign(target, patch);
          }),

        removeSection: (id) =>
          set((s) => {
            const sections = doc(s).sections;
            const i = sections.findIndex((x) => x.id === id);
            if (i !== -1) sections.splice(i, 1);
          }),

        moveSection: (activeId, overId) =>
          set((s) => {
            const sections = doc(s).sections;
            const from = sections.findIndex((x) => x.id === activeId);
            if (from === -1) return;

            if (overId.startsWith(COLUMN_PREFIX)) {
              // Брошено на пустое место колонки — уходит в её конец.
              const column = overId.slice(COLUMN_PREFIX.length) as Column;
              sections[from].column = column;
              move(sections, from, sections.length - 1);
              return;
            }

            const to = sections.findIndex((x) => x.id === overId);
            if (to === -1 || to === from) return;
            sections[from].column = sections[to].column;
            move(sections, from, to);
          }),

        addItem: (sectionId) =>
          set((s) => {
            const target = section(s, sectionId);
            if (!target) return;
            switch (target.type) {
              case 'experience':
                target.items.push(emptyExperience());
                break;
              case 'projects':
                target.items.push(emptyProject());
                break;
              case 'education':
                target.items.push(emptyEducation());
                break;
              case 'skills':
                target.items.push(emptySkill());
                break;
              case 'text':
                break;
            }
          }),

        addSkill: (sectionId, name) =>
          set((s) => {
            const target = section(s, sectionId);
            if (target?.type === 'skills') target.items.push({ ...emptySkill(), name });
          }),

        updateItem: (sectionId, itemId, patch) =>
          set((s) => {
            const target = section(s, sectionId);
            if (!target || target.type === 'text') return;
            const item = (target.items as { id: string }[]).find((x) => x.id === itemId);
            if (item) Object.assign(item, patch);
          }),

        removeItem: (sectionId, itemId) =>
          set((s) => {
            const target = section(s, sectionId);
            if (!target || target.type === 'text') return;
            const items = target.items as { id: string }[];
            const i = items.findIndex((x) => x.id === itemId);
            if (i !== -1) items.splice(i, 1);
          }),

        moveItem: (sectionId, activeId, overId) =>
          set((s) => {
            const target = section(s, sectionId);
            if (!target || target.type === 'text') return;
            const items = target.items as { id: string }[];
            const from = items.findIndex((x) => x.id === activeId);
            const to = items.findIndex((x) => x.id === overId);
            if (from === -1 || to === -1 || from === to) return;
            move(items, from, to);
          }),

        setBullets: (sectionId, itemId, bullets) =>
          set((s) => {
            const target = section(s, sectionId);
            if (!target || target.type === 'text' || target.type === 'skills') return;
            const item = (target.items as { id: string; bullets: string[] }[]).find(
              (x) => x.id === itemId,
            );
            if (item) item.bullets = bullets;
          }),

        setTextBody: (sectionId, body) =>
          set((s) => {
            const target = section(s, sectionId);
            if (target?.type === 'text') target.body = body;
          }),
      };
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ version: s.version, lang: s.lang, docs: s.docs }) as ResumeFile,
    },
  ),
);

/** Секции текущего языка в одной колонке, в порядке отображения. */
export const columnSections = (doc: ResumeDoc, column: Column): Section[] =>
  doc.sections.filter((s) => s.column === column);
