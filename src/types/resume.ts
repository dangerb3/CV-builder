/**
 * Модель резюме.
 *
 * Документ — это плоский упорядоченный список секций. Каждая секция знает,
 * в какой колонке она живёт и виден ли она; порядок в массиве задаёт порядок
 * на странице. Такая форма даёт drag-n-drop почти бесплатно и позволяет
 * добавлять новые блоки, не трогая код шаблона.
 */

export type Lang = 'en' | 'ru';

export type Column = 'left' | 'right';

export type ContactKind =
  | 'email'
  | 'phone'
  | 'location'
  | 'linkedin'
  | 'github'
  | 'website';

export interface Contact {
  id: string;
  kind: ContactKind;
  value: string;
}

export interface Basics {
  name: string;
  title: string;
  /** Строка под должностью: «Open to remote. Citizenship: Moldova.» */
  tagline: string;
  /** data-URL, чтобы экспорт JSON оставался самодостаточным. */
  photo: string;
  contacts: Contact[];
}

/** Место работы: заголовок, подзаголовок, период, описание и буллеты. */
export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  /** Курсивная строка с описанием компании. */
  summary: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  /** Ссылка справа от названия через « | ». */
  link: string;
  /** Строка-подводка над буллетами (может быть пустой). */
  summary: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  bullets: string[];
}

export interface SkillItem {
  id: string;
  name: string;
}

interface SectionBase {
  id: string;
  title: string;
  column: Column;
  visible: boolean;
  /**
   * Оформление секции. Поля необязательные: без них секция выглядит как
   * раньше, а старые JSON-файлы остаются валидными.
   */
  /** Горизонтальная линейка под заголовком секции. */
  divider?: boolean;
  /** Период уходит вправо, на одну строку с первой строкой записи. */
  periodInline?: boolean;
  /** Вид маркера списка. По умолчанию — кружок, как в исходном шаблоне. */
  bulletStyle?: BulletStyle;
}

/** Кружок — базовый шаблон, тире и «без маркера» — академический стиль. */
export type BulletStyle = 'circle' | 'dash' | 'none';

/** Флаги-переключатели оформления, которые редактор показывает галочками. */
export type SectionStyleFlag = 'divider' | 'periodInline';

export interface ExperienceSection extends SectionBase {
  type: 'experience';
  items: ExperienceItem[];
}

export interface ProjectsSection extends SectionBase {
  type: 'projects';
  items: ProjectItem[];
}

export interface EducationSection extends SectionBase {
  type: 'education';
  items: EducationItem[];
}

export interface SkillsSection extends SectionBase {
  type: 'skills';
  items: SkillItem[];
}

/** Свободный блок для всего остального: языки, сертификаты, «About me». */
export interface TextSection extends SectionBase {
  type: 'text';
  body: string;
}

export type Section =
  | ExperienceSection
  | ProjectsSection
  | EducationSection
  | SkillsSection
  | TextSection;

export type SectionType = Section['type'];

export interface ResumeDoc {
  basics: Basics;
  sections: Section[];
}

/** Всё состояние приложения — то, что уходит в localStorage и в JSON-файл. */
export interface ResumeFile {
  version: 1;
  lang: Lang;
  docs: Record<Lang, ResumeDoc>;
}
