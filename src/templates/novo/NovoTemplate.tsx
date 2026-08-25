import type { BulletStyle, ResumeDoc, Section } from '../../types/resume';
import { ContactIcon } from './ContactIcon';
import { RichText } from './RichText';
import './novo.css';

export interface TemplateLabels {
  /** Курсивная подпись над списком достижений. */
  achievements: string;
}

/** Пустые строки не должны оставлять дыры в вёрстке. */
const filled = (list: string[]): string[] => list.filter((b) => b.trim() !== '');

function Bullets({
  items,
  tight,
  style = 'circle',
}: {
  items: string[];
  tight?: boolean;
  style?: BulletStyle;
}) {
  const visible = filled(items);
  if (visible.length === 0) return null;

  const classes = ['novo-bullets'];
  if (tight) classes.push('novo-bullets--tight');
  if (style !== 'circle') classes.push(`novo-bullets--${style}`);

  return (
    <ul className={classes.join(' ')}>
      {visible.map((text, i) => (
        <li key={i}>
          <RichText text={text} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Первая строка записи. При `periodInline` период встаёт справа на ту же
 * строку — так набирают академические резюме; иначе он идёт ниже, курсивом.
 */
function Headline({
  text,
  period,
  inline,
}: {
  text: string;
  period: string;
  inline?: boolean;
}) {
  if (!inline || !period) {
    return (
      <div className="novo-entry-role">
        <RichText text={text} />
      </div>
    );
  }

  return (
    <div className="novo-entry-headline">
      <div className="novo-entry-role">
        <RichText text={text} />
      </div>
      <div className="novo-entry-dates">{period}</div>
    </div>
  );
}

function SectionBody({ section, labels }: { section: Section; labels: TemplateLabels }) {
  const { periodInline, bulletStyle } = section;

  switch (section.type) {
    case 'experience':
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} className="novo-entry novo-entry--ticked">
              <Headline text={item.role} period={item.period} inline={periodInline} />
              <div className="novo-entry-org">
                <RichText text={item.company} />
              </div>
              {item.period && !periodInline && (
                <div className="novo-entry-period">{item.period}</div>
              )}
              {item.summary && (
                <div className="novo-entry-summary">
                  <RichText text={item.summary} />
                </div>
              )}
              {filled(item.bullets).length > 0 && (
                <div className="novo-entry-label">{labels.achievements}</div>
              )}
              <Bullets items={item.bullets} style={bulletStyle} />
            </div>
          ))}
        </>
      );

    case 'projects':
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} className="novo-entry">
              {/* Запись может быть просто списком строк — тогда заголовка нет. */}
              {(item.name || item.link) && (
                <div className="novo-project-name">
                  <RichText text={item.name} />
                  {item.link && <span className="novo-project-link"> | {item.link}</span>}
                </div>
              )}
              {item.summary && (
                <div className="novo-entry-summary">
                  <RichText text={item.summary} />
                </div>
              )}
              <Bullets items={item.bullets} tight style={bulletStyle} />
            </div>
          ))}
        </>
      );

    case 'education':
      return (
        <>
          {section.items.map((item) => (
            <div key={item.id} className="novo-entry novo-entry--ticked">
              <Headline text={item.degree} period={item.period} inline={periodInline} />
              <div className="novo-entry-org">
                <RichText text={item.institution} />
              </div>
              {item.period && !periodInline && (
                <div className="novo-entry-period">{item.period}</div>
              )}
              <Bullets items={item.bullets} tight style={bulletStyle} />
            </div>
          ))}
        </>
      );

    case 'skills':
      return (
        <div className="novo-chips">
          {section.items
            .filter((skill) => skill.name.trim() !== '')
            .map((skill) => (
              <span key={skill.id} className="novo-chip">
                {skill.name}
              </span>
            ))}
        </div>
      );

    case 'text':
      return (
        <div className="novo-text-body">
          <RichText text={section.body} />
        </div>
      );
  }
}

function Column({ sections, labels }: { sections: Section[]; labels: TemplateLabels }) {
  return (
    <div className="novo-column">
      {sections.map((section) => (
        <section key={section.id} className="novo-section">
          <h2
            className={
              section.divider
                ? 'novo-section-title novo-section-title--divider'
                : 'novo-section-title'
            }
          >
            {section.title}
          </h2>
          <SectionBody section={section} labels={labels} />
        </section>
      ))}
    </div>
  );
}

export function NovoTemplate({ doc, labels }: { doc: ResumeDoc; labels: TemplateLabels }) {
  const { basics } = doc;
  const visible = doc.sections.filter((s) => s.visible);

  return (
    <article className="a4">
      <header className="novo-header">
        {basics.photo && <img className="novo-photo" src={basics.photo} alt="" />}
        <div>
          <h1 className="novo-name">{basics.name}</h1>
          {basics.title && <p className="novo-title">{basics.title}</p>}
          {basics.tagline && <p className="novo-tagline">{basics.tagline}</p>}
        </div>
      </header>

      <div className="novo-contacts">
        {basics.contacts
          .filter((c) => c.value.trim() !== '')
          .map((contact) => (
            <div key={contact.id} className="novo-contact">
              <ContactIcon kind={contact.kind} />
              <span>{contact.value}</span>
            </div>
          ))}
      </div>

      <div className="novo-body">
        <Column sections={visible.filter((s) => s.column === 'left')} labels={labels} />
        <Column sections={visible.filter((s) => s.column === 'right')} labels={labels} />
      </div>
    </article>
  );
}
