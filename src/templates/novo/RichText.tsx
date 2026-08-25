import { parseMarkup } from '../../lib/richText';

/** Текст поля с поддержкой `**жирного**` и `*курсива*`. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseMarkup(text).map((token, i) => {
        if (token.bold) return <strong key={i}>{token.text}</strong>;
        if (token.italic) return <em key={i}>{token.text}</em>;
        return token.text;
      })}
    </>
  );
}
