import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

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
      className="touch-none cursor-grab rounded px-1 py-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing lg:py-0"
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

/**
 * Кнопка с выпадающим списком действий. Нужна тулбару на узком экране, где
 * восемь кнопок в строку не помещаются: второстепенное уезжает сюда.
 */
export function Menu({
  label,
  ariaLabel,
  children,
}: {
  label: ReactNode;
  ariaLabel: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </Button>

      {open && (
        <div
          id={id}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 flex min-w-44 flex-col gap-0.5 rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Пункт меню: та же кнопка, но во всю ширину списка и с текстом слева. */
export function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="rounded px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100"
    >
      {children}
    </button>
  );
}
