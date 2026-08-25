import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useState, type KeyboardEvent } from 'react';
import type { SkillItem } from '../../types/resume';
import { useResumeStore } from '../../store/useResumeStore';
import { Input, SortableItem } from './ui';

/**
 * Навыки редактируются как чипы: клик по чипу переводит его в поле ввода,
 * перетаскивание меняет порядок. Так редактор выглядит как результат.
 */
export function SkillsFields({
  sectionId,
  items,
}: {
  sectionId: string;
  items: SkillItem[];
}) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateItem = useResumeStore((s) => s.updateItem);
  const removeItem = useResumeStore((s) => s.removeItem);
  const moveItem = useResumeStore((s) => s.moveItem);
  const addSkill = useResumeStore((s) => s.addSkill);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const commitDraft = () => {
    const name = draft.trim();
    if (!name) return;
    addSkill(sectionId, name);
    setDraft('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      moveItem(sectionId, String(active.id), String(over.id));
    }
  };

  return (
    <div className="space-y-2.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-1.5">
            {items.map((skill) => (
              <SortableItem key={skill.id} id={skill.id}>
                {(handle) =>
                  editingId === skill.id ? (
                    <input
                      autoFocus
                      value={skill.name}
                      onChange={(e) => updateItem(sectionId, skill.id, { name: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="w-32 rounded border border-slate-400 px-2 py-1 text-xs outline-none"
                    />
                  ) : (
                    <span
                      {...handle.attributes}
                      {...handle.listeners}
                      onClick={() => setEditingId(skill.id)}
                      className="inline-flex cursor-grab items-center gap-1.5 rounded bg-slate-500 px-2 py-1 text-xs text-white select-none active:cursor-grabbing"
                    >
                      {skill.name || '—'}
                      <button
                        type="button"
                        aria-label="Удалить навык"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(sectionId, skill.id);
                        }}
                        className="text-slate-300 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  )
                }
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Input
        value={draft}
        placeholder="Новый навык — Enter, чтобы добавить"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commitDraft}
      />
    </div>
  );
}
