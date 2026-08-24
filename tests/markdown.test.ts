import { expect, test } from 'vitest'
import { HyperTextMarkerToken, UnknownToken, SymbolToken, 
  HeadingToken, WhitespaceToken, IndentationToken, 
  TokenEndOfFile, HyperTextMarkerTokenTag, EndOfLineToken,
  tokenize, transpile_md_to_html } from '../src/index.ts'

test('the lexer handles atx-heading indicators', () => {
  let input = "#\n##\n###\n####\n#####\n######"
  let expected: HyperTextMarkerToken[] = [
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL, 
      repeat_count: 1,
      symbol: '#',
      meta: {
        representation: "#", 
        length: 1,
        start: 0,
        end: 1,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: '\n',
        length: 1,
        start: 1,
        end: 1,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      repeat_count: 2,
      symbol: '#',
      meta: {
        representation: "##",
        length: 2,
        start: 2,
        end: 4,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 4,
        end: 4,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL, 
      repeat_count: 3,
      symbol: '#',
      meta: {
        representation: "###",
        length: 3,
        start: 5,
        end: 8,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 8,
        end: 8,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      repeat_count: 4,
      symbol: '#',
      meta: {
        representation: "####",
        length: 4,
        start: 9,
        end: 13,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 13,
        end: 13,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      repeat_count: 5,
      symbol: '#',
      meta: {
        representation: "#####",
        length: 5,
        start: 14,
        end: 19,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: '\n',
        length: 1,
        start: 19,
        end: 19,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      repeat_count: 6,
      symbol: '#',
      meta: {
        representation: "######",
        length: 6,
        start: 20,
        end: 26,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        length: 1,
        start: 26,
        end: 26, 
      }
    } as EndOfFileToken,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles whitespace as token and does not ignore it', () => {
  let input = "   ";
  let expected: HyperTextMarkerToken[] = [
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 3,
      foldable: false,
      meta: {
        representation: "   ",
        length: 3,
        start: 0,
        end: 3,
      }
    } as WhitespaceToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        length: 1,
        start: 3,
        end: 3,
      }
    } as TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles tab symbols or 4 consecutive whitespaces as indentation level', () => {
  let input = "    \n\t\n";

  let expected: HyperTextMarkerToken[] = [
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 4,
      foldable: false,
      meta: {
        representation: "    ",
        start: 0,
        end: 4,
        length: 4,
      } 
    } as IndentationToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        start: 4,
        end: 4,
        length: 1,
      } 
    } as EndOfLineToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: true,
      meta: {
        representation: "\t",
        start: 5,
        end: 5,
        length: 1,
      }
    } as IndentationToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        start: 6,
        end: 6,
        length: 1,
      }
    } as EndOfLineToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        start: 7,
        end: 7,
        length: 1,
      }
    } as TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})
