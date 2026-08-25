import type {
  EducationItem,
  ExperienceItem,
  ProjectItem,
  Section,
  SectionType,
  SkillItem,
} from '../types/resume';

export const uid = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const emptyExperience = (): ExperienceItem => ({
  id: uid('e'),
  role: '',
  company: '',
  period: '',
  summary: '',
  bullets: [''],
});

export const emptyProject = (): ProjectItem => ({
  id: uid('p'),
  name: '',
  link: '',
  summary: '',
  bullets: [''],
});

export const emptyEducation = (): EducationItem => ({
  id: uid('ed'),
  degree: '',
  institution: '',
  period: '',
  bullets: [],
});

export const emptySkill = (): SkillItem => ({ id: uid('sk'), name: '' });

/** Новая секция выбранного типа — заголовок пользователь меняет сам. */
export const emptySection = (type: SectionType, title: string): Section => {
  const base = { id: uid('s'), title, column: 'left' as const, visible: true };
  switch (type) {
    case 'experience':
      return { ...base, type, items: [emptyExperience()] };
    case 'projects':
      return { ...base, type, items: [emptyProject()] };
    case 'education':
      return { ...base, type, items: [emptyEducation()] };
    case 'skills':
      return { ...base, type, items: [] };
    case 'text':
      return { ...base, type, body: '' };
  }
};
