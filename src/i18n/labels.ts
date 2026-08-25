import type { Lang, SectionType } from '../types/resume';

/** Подписи внутри самого резюме — зависят от языка документа. */
export const templateLabels: Record<Lang, { achievements: string }> = {
  en: { achievements: 'Achievements/Tasks' },
  ru: { achievements: 'Достижения/Задачи' },
};

/** Заголовок по умолчанию для новой секции выбранного типа. */
export const defaultSectionTitle: Record<Lang, Record<SectionType, string>> = {
  en: {
    experience: 'Work Experience',
    projects: 'Personal Projects',
    education: 'Education',
    skills: 'Skills',
    text: 'About Me',
  },
  ru: {
    experience: 'Опыт работы',
    projects: 'Личные проекты',
    education: 'Образование',
    skills: 'Навыки',
    text: 'О себе',
  },
};

/** Человекочитаемые названия типов секций для меню «Добавить секцию». */
export const sectionTypeNames: Record<SectionType, string> = {
  experience: 'Опыт работы',
  projects: 'Проекты',
  education: 'Образование',
  skills: 'Навыки (чипы)',
  text: 'Свободный текст',
};
