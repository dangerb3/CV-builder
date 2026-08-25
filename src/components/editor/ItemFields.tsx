import type { EducationItem, ExperienceItem, ProjectItem } from '../../types/resume';
import { BulletsEditor } from './BulletsEditor';
import { AutoTextarea, Field, Input } from './ui';

/* Поля одной записи. Компоненты не знают про стор — правки уходят наверх,
   в SectionCard, который уже адресует их нужной секции. */

interface FieldsProps<T> {
  item: T;
  onPatch: (patch: Partial<T>) => void;
  onBullets: (bullets: string[]) => void;
}

export function ExperienceFields({
  item,
  onPatch,
  onBullets,
}: FieldsProps<ExperienceItem>) {
  return (
    <div className="space-y-2.5">
      <Field label="Должность">
        <Input value={item.role} onChange={(e) => onPatch({ role: e.target.value })} />
      </Field>
      <Field label="Компания">
        <Input value={item.company} onChange={(e) => onPatch({ company: e.target.value })} />
      </Field>
      <Field label="Период">
        <Input
          value={item.period}
          placeholder="11/2024 - 05/2026"
          onChange={(e) => onPatch({ period: e.target.value })}
        />
      </Field>
      <Field label="О компании (курсив)">
        <AutoTextarea
          value={item.summary}
          onChange={(e) => onPatch({ summary: e.target.value })}
        />
      </Field>
      <Field label="Достижения">
        <BulletsEditor bullets={item.bullets} idPrefix={item.id} onChange={onBullets} />
      </Field>
    </div>
  );
}

export function ProjectFields({ item, onPatch, onBullets }: FieldsProps<ProjectItem>) {
  return (
    <div className="space-y-2.5">
      <Field label="Название">
        <Input value={item.name} onChange={(e) => onPatch({ name: e.target.value })} />
      </Field>
      <Field label="Ссылка">
        <Input
          value={item.link}
          placeholder="example.com/project"
          onChange={(e) => onPatch({ link: e.target.value })}
        />
      </Field>
      <Field label="Подводка (курсив, необязательно)">
        <AutoTextarea
          value={item.summary}
          onChange={(e) => onPatch({ summary: e.target.value })}
        />
      </Field>
      <Field label="Пункты">
        <BulletsEditor bullets={item.bullets} idPrefix={item.id} onChange={onBullets} />
      </Field>
    </div>
  );
}

export function EducationFields({
  item,
  onPatch,
  onBullets,
}: FieldsProps<EducationItem>) {
  return (
    <div className="space-y-2.5">
      <Field label="Специальность">
        <Input value={item.degree} onChange={(e) => onPatch({ degree: e.target.value })} />
      </Field>
      <Field label="Учебное заведение">
        <AutoTextarea
          value={item.institution}
          onChange={(e) => onPatch({ institution: e.target.value })}
        />
      </Field>
      <Field label="Период">
        <Input
          value={item.period}
          placeholder="09/2017 - 06/2021"
          onChange={(e) => onPatch({ period: e.target.value })}
        />
      </Field>
      <Field label="Пункты">
        <BulletsEditor bullets={item.bullets} idPrefix={item.id} onChange={onBullets} />
      </Field>
    </div>
  );
}
