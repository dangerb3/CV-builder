import { describe, expect, it } from 'vitest';
import { parseMarkup } from './richText';

const plain = (text: string) => ({ text, bold: false, italic: false });
const bold = (text: string) => ({ text, bold: true, italic: false });
const italic = (text: string) => ({ text, bold: false, italic: true });

describe('parseMarkup', () => {
  it('выделяет жирную подпись в начале строки', () => {
    expect(parseMarkup('**GPA:** 4.4 / 5.0')).toEqual([bold('GPA:'), plain(' 4.4 / 5.0')]);
  });

  it('выделяет курсив одинарными звёздочками', () => {
    expect(parseMarkup('*B.S. in Information Systems*')).toEqual([
      italic('B.S. in Information Systems'),
    ]);
  });

  it('не путает двойные звёздочки с курсивом вокруг пустоты', () => {
    expect(parseMarkup('**Жирный**')).toEqual([bold('Жирный')]);
  });

  it('находит несколько кусков подряд', () => {
    expect(parseMarkup('**A** и *B*')).toEqual([bold('A'), plain(' и '), italic('B')]);
  });

  it('оставляет обычный текст одним куском', () => {
    expect(parseMarkup('просто строка')).toEqual([plain('просто строка')]);
  });

  it('не трогает незакрытые звёздочки', () => {
    expect(parseMarkup('**без пары')).toEqual([plain('**без пары')]);
  });

  it('на пустой строке ничего не возвращает', () => {
    expect(parseMarkup('')).toEqual([]);
  });
});
