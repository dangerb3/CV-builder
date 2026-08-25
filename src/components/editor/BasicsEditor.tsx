import type { ChangeEvent } from 'react';
import type { Basics, ContactKind } from '../../types/resume';
import { readImageAsDataUrl } from '../../lib/io';
import { useResumeStore } from '../../store/useResumeStore';
import { Button, Field, Input } from './ui';

const CONTACT_KINDS: { kind: ContactKind; name: string }[] = [
  { kind: 'email', name: 'Email' },
  { kind: 'phone', name: 'Телефон' },
  { kind: 'location', name: 'Локация' },
  { kind: 'linkedin', name: 'LinkedIn' },
  { kind: 'github', name: 'GitHub' },
  { kind: 'website', name: 'Сайт' },
];

export function BasicsEditor({ basics }: { basics: Basics }) {
  const updateBasics = useResumeStore((s) => s.updateBasics);
  const addContact = useResumeStore((s) => s.addContact);
  const updateContact = useResumeStore((s) => s.updateContact);
  const removeContact = useResumeStore((s) => s.removeContact);

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateBasics({ photo: await readImageAsDataUrl(file) });
    e.target.value = '';
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">Шапка</h2>

      <div className="mb-3 flex items-center gap-3">
        <img
          src={basics.photo || undefined}
          alt=""
          className="h-16 w-16 rounded-full bg-slate-200 object-cover"
        />
        <div className="flex flex-col gap-1.5">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
            Заменить фото
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          {basics.photo && (
            <Button variant="danger" onClick={() => updateBasics({ photo: '' })}>
              Убрать фото
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <Field label="Имя">
          <Input
            value={basics.name}
            onChange={(e) => updateBasics({ name: e.target.value })}
          />
        </Field>
        <Field label="Должность">
          <Input
            value={basics.title}
            onChange={(e) => updateBasics({ title: e.target.value })}
          />
        </Field>
        <Field label="Подпись под должностью">
          <Input
            value={basics.tagline}
            placeholder="Open to remote. Citizenship: …"
            onChange={(e) => updateBasics({ tagline: e.target.value })}
          />
        </Field>
      </div>

      <h3 className="mt-4 mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        Контакты
      </h3>
      <p className="mb-2 text-[11px] text-slate-400">
        Заполняют тёмную полосу слева направо, по два в ряд.
      </p>

      <div className="space-y-1.5">
        {basics.contacts.map((contact) => (
          <div key={contact.id} className="flex items-center gap-1.5">
            <select
              value={contact.kind}
              onChange={(e) =>
                updateContact(contact.id, { kind: e.target.value as ContactKind })
              }
              className="rounded-md border border-slate-300 bg-white px-1.5 py-1.5 text-xs text-slate-700"
            >
              {CONTACT_KINDS.map((c) => (
                <option key={c.kind} value={c.kind}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input
              value={contact.value}
              onChange={(e) => updateContact(contact.id, { value: e.target.value })}
            />
            <Button
              variant="danger"
              aria-label="Удалить контакт"
              onClick={() => removeContact(contact.id)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <Button className="mt-2" onClick={() => addContact('website')}>
        + контакт
      </Button>
    </section>
  );
}
