import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Column, ResumeDoc, SectionType } from '../../types/resume';
import { defaultSectionTitle, sectionTypeNames } from '../../i18n/labels';
import { columnSections, useResumeStore } from '../../store/useResumeStore';
import { SectionCard } from './SectionCard';
import { Button, SortableItem } from './ui';

const COLUMN_NAMES: Record<Column, string> = {
  left: 'Левая колонка',
  right: 'Правая колонка',
};

function ColumnDropZone({ column, doc }: { column: Column; doc: ResumeDoc }) {
  const sections = columnSections(doc, column);
  // Собственный droppable нужен, чтобы секцию можно было бросить в пустую колонку.
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column}` });

  return (
    <div>
      <h3 className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {COLUMN_NAMES[column]}
      </h3>
      <div
        ref={setNodeRef}
        className={`min-h-16 space-y-2 rounded-lg border-2 border-dashed p-1.5 transition ${
          isOver ? 'border-slate-400 bg-slate-100' : 'border-transparent'
        }`}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableItem key={section.id} id={section.id}>
              {(handle) => <SectionCard section={section} handle={handle} />}
            </SortableItem>
          ))}
        </SortableContext>
        {sections.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-slate-400">
            Перетащи сюда секцию
          </p>
        )}
      </div>
    </div>
  );
}

export function SectionsEditor({ doc }: { doc: ResumeDoc }) {
  const lang = useResumeStore((s) => s.lang);
  const moveSection = useResumeStore((s) => s.moveSection);
  const addSection = useResumeStore((s) => s.addSection);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) moveSection(String(active.id), String(over.id));
  };

  const handleAdd = (type: SectionType) =>
    addSection(type, defaultSectionTitle[lang][type]);

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <ColumnDropZone column="left" doc={doc} />
        <ColumnDropZone column="right" doc={doc} />
      </DndContext>

      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
        <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Добавить секцию
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(sectionTypeNames) as SectionType[]).map((type) => (
            <Button key={type} onClick={() => handleAdd(type)}>
              + {sectionTypeNames[type]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
