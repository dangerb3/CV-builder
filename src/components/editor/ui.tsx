import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';

/* Мелкие примитивы редактора. Держим их в одном файле — по отдельности
   это были бы файлы на пятнадцать строк. */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 ' +
  'outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

/** Текстовое поле, которое подстраивает высоту под содержимое. */
export function AutoTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return <textarea {...props} ref={ref} rows={1} className={`${inputClass} resize-none`} />;
}

export function Button({
  variant = 'ghost',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const styles = {
    primary: 'bg-slate-800 text-white hover:bg-slate-700',
    ghost: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
    danger: 'border border-transparent text-slate-400 hover:bg-red-50 hover:text-red-600',
  }[variant];

  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

type Sortable = ReturnType<typeof useSortable>;

export interface HandleProps {
  attributes: Sortable['attributes'];
  listeners: Sortable['listeners'];
}

/** Обёртка сортируемого элемента: сам тащится только за ручку. */
export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: HandleProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

export function DragHandle({ handle }: { handle: HandleProps }) {
  return (
    <button
      type="button"
      aria-label="Перетащить"
      {...handle.attributes}
      {...handle.listeners}
      className="cursor-grab rounded px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
        <circle cx="3.5" cy="3" r="1.4" />
        <circle cx="8.5" cy="3" r="1.4" />
        <circle cx="3.5" cy="8" r="1.4" />
        <circle cx="8.5" cy="8" r="1.4" />
        <circle cx="3.5" cy="13" r="1.4" />
        <circle cx="8.5" cy="13" r="1.4" />
      </svg>
    </button>
  );
}
