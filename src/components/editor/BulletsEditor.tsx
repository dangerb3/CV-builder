import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AutoTextarea, Button, DragHandle, SortableItem } from './ui';

/**
 * Список достижений. Строки редактируются на месте и переставляются
 * перетаскиванием за ручку; ключ по индексу здесь безопасен, потому что
 * перестановка всегда идёт через onChange с новым массивом.
 */
export function BulletsEditor({
  bullets,
  idPrefix,
  onChange,
}: {
  bullets: string[];
  idPrefix: string;
  onChange: (next: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = bullets.map((_, i) => `${idPrefix}-b${i}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const next = [...bullets];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const setAt = (index: number, value: string) =>
    onChange(bullets.map((b, i) => (i === index ? value : b)));

  const removeAt = (index: number) => onChange(bullets.filter((_, i) => i !== index));

  return (
    <div className="space-y-1.5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {bullets.map((bullet, i) => (
            <SortableItem key={ids[i]} id={ids[i]}>
              {(handle) => (
                <div className="flex items-start gap-1">
                  <div className="pt-2">
                    <DragHandle handle={handle} />
                  </div>
                  <AutoTextarea
                    value={bullet}
                    placeholder="Достижение или задача"
                    onChange={(e) => setAt(i, e.target.value)}
                  />
                  <Button
                    variant="danger"
                    className="mt-0.5"
                    aria-label="Удалить строку"
                    onClick={() => removeAt(i)}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      <Button onClick={() => onChange([...bullets, ''])}>+ строка</Button>
    </div>
  );
}
