import { expect, test } from 'vitest'
import { HyperTextMarkerToken, UnknownToken, SymbolToken, 
  HeadingToken, WhitespaceToken, IndentationToken, 
  TokenEndOfFile, HyperTextMarkerTokenTag, EndOfLineToken,
  tokenize, transpile_md_to_html } from '../src/index.ts'

//NOTE: Markdown is after checking the format, not context free :( that means we need a lexer and make multiple passes over the input file.


/*test('the lexer handles symbols as seperate tokens', () => {
  let input = '*';
  let expected: HyperTextMarkerToken[] = [
    HyperTextMarkerToken.TOKEN_STAR_SYMBOL,
    HyperTextMarkerToken.TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})*/

test('the lexer handles atx-heading indicators', () => {
  let input = "# \n## \n### \n#### \n##### \n###### "
  let expected: HyperTextMarkerToken[] = [
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING, 
      depth: 1,
      meta: {
        representation: "#", 
        length: 1,
        start: 0,
        end: 0,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: '\n',
        length: 1,
        start: 2,
        end: 2,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
      depth: 2,
      meta: {
        representation: "##",
        length: 2,
        start: 3,
        end: 4,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 6,
        end: 6,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING, 
      depth: 3,
      meta: {
        representation: "###",
        length: 3,
        start: 7,
        end: 9,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 11,
        end: 11,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
      depth: 4,
      meta: {
        representation: "####",
        length: 4,
        start: 12,
        end: 15,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: 17,
        end: 17,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
      depth: 5,
      meta: {
        representation: "#####",
        length: 5,
        start: 18,
        end: 22,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: '\n',
        length: 1,
        start: 24,
        end: 24,
      }
    } as EndOfLineToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
      depth: 6,
      meta: {
        representation: "######",
        length: 6,
        start: 25,
        end: 30,
      }
    } as HeadingToken,
    {
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        length: 1,
        start: 32,
        end: 32, 
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
      meta: {
        representation: " ",
        length: 1,
        start: 0,
        end: 0,
      }
    } as WhitespaceToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      meta: {
        representation: " ",
        length: 1,
        start: 1,
        end: 1,
      }
    } as WhitespaceToken,
    { 
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      meta: {
        representation: " ",
        length: 1,
        start: 2,
        end: 2,
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
      kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION,
      meta: {
        representation: "    ",
        start: 0,
        end: 3,
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
      kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION,
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
