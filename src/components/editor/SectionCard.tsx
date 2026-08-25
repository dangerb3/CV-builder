import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, type ReactNode } from 'react';
import type { BulletStyle, Section, SectionStyleFlag } from '../../types/resume';
import { useResumeStore } from '../../store/useResumeStore';
import { EducationFields, ExperienceFields, ProjectFields } from './ItemFields';
import { SkillsFields } from './SkillsFields';
import { AutoTextarea, Button, DragHandle, Input, SortableItem, type HandleProps } from './ui';

const ADD_ITEM_LABEL: Record<Section['type'], string> = {
  experience: '+ место работы',
  projects: '+ проект',
  education: '+ учебное заведение',
  skills: '',
  text: '',
};

/** Общая обвязка записи: ручка перетаскивания, кнопка удаления, поля внутри. */
function ItemShell({
  id,
  onRemove,
  children,
}: {
  id: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <SortableItem id={id}>
      {(handle) => (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <DragHandle handle={handle} />
            <Button variant="danger" onClick={onRemove}>
              Удалить
            </Button>
          </div>
          {children}
        </div>
      )}
    </SortableItem>
  );
}

/**
 * Записи внутри секции. Ветвление по типу идёт на уровне всего списка,
 * а не отдельной записи, — только так TypeScript сужает тип элементов.
 */
function ItemList({ section }: { section: Section }) {
  const updateItem = useResumeStore((s) => s.updateItem);
  const removeItem = useResumeStore((s) => s.removeItem);
  const moveItem = useResumeStore((s) => s.moveItem);
  const setBullets = useResumeStore((s) => s.setBullets);
  const setTextBody = useResumeStore((s) => s.setTextBody);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  if (section.type === 'text') {
    return (
      <AutoTextarea
        value={section.body}
        placeholder="Текст секции"
        onChange={(e) => setTextBody(section.id, e.target.value)}
      />
    );
  }

  if (section.type === 'skills') {
    return <SkillsFields sectionId={section.id} items={section.items} />;
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      moveItem(section.id, String(active.id), String(over.id));
    }
  };

  const patch = (itemId: string) => (p: object) => updateItem(section.id, itemId, p);
  const bullets = (itemId: string) => (b: string[]) => setBullets(section.id, itemId, b);
  const remove = (itemId: string) => () => removeItem(section.id, itemId);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={section.items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5">
          {section.type === 'experience' &&
            section.items.map((item) => (
              <ItemShell key={item.id} id={item.id} onRemove={remove(item.id)}>
                <ExperienceFields
                  item={item}
                  onPatch={patch(item.id)}
                  onBullets={bullets(item.id)}
                />
              </ItemShell>
            ))}

          {section.type === 'projects' &&
            section.items.map((item) => (
              <ItemShell key={item.id} id={item.id} onRemove={remove(item.id)}>
                <ProjectFields
                  item={item}
                  onPatch={patch(item.id)}
                  onBullets={bullets(item.id)}
                />
              </ItemShell>
            ))}

          {section.type === 'education' &&
            section.items.map((item) => (
              <ItemShell key={item.id} id={item.id} onRemove={remove(item.id)}>
                <EducationFields
                  item={item}
                  onPatch={patch(item.id)}
                  onBullets={bullets(item.id)}
                />
              </ItemShell>
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

const BULLET_STYLES: { value: BulletStyle; label: string }[] = [
  { value: 'circle', label: 'кружки' },
  { value: 'dash', label: 'тире' },
  { value: 'none', label: 'без маркеров' },
];

/** Оформление секции. Показываем только то, что осмысленно для её типа. */
function StyleFlags({ section }: { section: Section }) {
  const updateSection = useResumeStore((s) => s.updateSection);
  const hasEntries = section.type === 'experience' || section.type === 'education';
  const hasBullets = hasEntries || section.type === 'projects';

  const flags: { key: SectionStyleFlag; label: string; show: boolean }[] = [
    { key: 'divider', label: 'Линейка под заголовком', show: true },
    { key: 'periodInline', label: 'Дата справа в строке', show: hasEntries },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md bg-slate-50 px-2.5 py-2">
      {flags
        .filter((flag) => flag.show)
        .map((flag) => (
          <label
            key={flag.key}
            className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600"
          >
            <input
              type="checkbox"
              checked={section[flag.key] ?? false}
              onChange={(e) => updateSection(section.id, { [flag.key]: e.target.checked })}
              className="accent-slate-700"
            />
            {flag.label}
          </label>
        ))}

      {hasBullets && (
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          Маркеры:
          <select
            value={section.bulletStyle ?? 'circle'}
            onChange={(e) =>
              updateSection(section.id, { bulletStyle: e.target.value as BulletStyle })
            }
            className="rounded border border-slate-300 bg-white px-1.5 py-1 text-xs"
          >
            {BULLET_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

export function SectionCard({
  section,
  handle,
}: {
  section: Section;
  handle: HandleProps;
}) {
  const [open, setOpen] = useState(false);
  const updateSection = useResumeStore((s) => s.updateSection);
  const removeSection = useResumeStore((s) => s.removeSection);
  const addItem = useResumeStore((s) => s.addItem);

  return (
    <div
      className={`rounded-lg border bg-white shadow-sm transition ${
        section.visible ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'
      }`}
    >
      <div className="flex items-center gap-1.5 p-2.5">
        <DragHandle handle={handle} />
        <Input
          value={section.title}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
        />
        <Button
          aria-label={section.visible ? 'Скрыть секцию' : 'Показать секцию'}
          title={section.visible ? 'Скрыть в резюме' : 'Показать в резюме'}
          onClick={() => updateSection(section.id, { visible: !section.visible })}
        >
          {section.visible ? '👁' : '🚫'}
        </Button>
        <Button
          title="Свернуть/развернуть"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '▲' : '▼'}
        </Button>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-slate-100 p-2.5">
          <StyleFlags section={section} />
          <ItemList section={section} />
          <div className="flex items-center justify-between pt-1">
            {ADD_ITEM_LABEL[section.type] ? (
              <Button onClick={() => addItem(section.id)}>
                {ADD_ITEM_LABEL[section.type]}
              </Button>
            ) : (
              <span />
            )}
            <Button variant="danger" onClick={() => removeSection(section.id)}>
              Удалить секцию
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
