/**
 * Минимальная разметка для текстовых полей резюме: `**жирный**` и `*курсив*`.
 *
 * Полноценный markdown здесь не нужен — в резюме встречаются ровно два приёма:
 * жирная подпись в начале строки («**GPA:** 4.4 / 5.0») и курсивная строка со
 * специальностью. Разбираем сами и отдаём React-узлы, поэтому HTML из полей
 * ввода никогда не исполняется.
 */

export interface TextToken {
  text: string;
  bold: boolean;
  italic: boolean;
}

/**
 * Двойные звёздочки идут первыми — иначе `**x**` разобралось бы как курсив
 * вокруг пустоты. Звёздочки внутри размеченного куска не поддерживаются.
 */
const MARKUP = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function parseMarkup(input: string): TextToken[] {
  const tokens: TextToken[] = [];
  let last = 0;

  for (const match of input.matchAll(MARKUP)) {
    const start = match.index;
    if (start > last) {
      tokens.push({ text: input.slice(last, start), bold: false, italic: false });
    }

    const bold = match[1] !== undefined;
    tokens.push({ text: bold ? match[1] : match[2], bold, italic: !bold });
    last = start + match[0].length;
  }

  if (last < input.length) {
    tokens.push({ text: input.slice(last), bold: false, italic: false });
  }

  return tokens;
}
