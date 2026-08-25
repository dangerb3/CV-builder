import type { ResumeDoc } from '../types/resume';

/**
 * Русская версия демонстрационного резюме — пустой каркас с теми же секциями.
 * Кнопка «Скопировать из EN» переносит содержимое английской версии, чтобы
 * переводить поверх готовой структуры.
 */
export const defaultResumeRu: ResumeDoc = {
  basics: {
    name: 'Алекс Морган',
    title: 'Frontend-разработчик',
    tagline: '',
    photo: '',
    contacts: [
      { id: 'c-email', kind: 'email', value: 'alex.morgan@example.com' },
      { id: 'c-phone', kind: 'phone', value: '+1 555 0100' },
      { id: 'c-location', kind: 'location', value: 'Берлин, Германия' },
      { id: 'c-linkedin', kind: 'linkedin', value: 'linkedin.com/in/example' },
      { id: 'c-github', kind: 'github', value: 'github.com/example' },
    ],
  },
  sections: [
    {
      id: 's-experience',
      type: 'experience',
      title: 'Опыт работы',
      column: 'left',
      visible: true,
      items: [],
    },
    {
      id: 's-skills',
      type: 'skills',
      title: 'Навыки',
      column: 'right',
      visible: true,
      items: [],
    },
    {
      id: 's-projects',
      type: 'projects',
      title: 'Личные проекты',
      column: 'right',
      visible: true,
      items: [],
    },
    {
      id: 's-education',
      type: 'education',
      title: 'Образование',
      column: 'right',
      visible: true,
      items: [],
    },
  ],
};
