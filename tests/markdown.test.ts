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
  let input = "#\n##\n###\n####\n#####\n######"
  let expected: HyperTextMarkerToken[] = [
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 1 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 2 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 3 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 4 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 5 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_HEADING, depth: 6 } as HeadingToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_EOF } as EndOfFileToken,
    HyperTextMarkerToken.TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles whitespace as token and does not ignore it', () => {
  let input = "   ";
  let expected: HyperTextMarkerToken[] = [
    { kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE } as WhitespaceToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE } as WhitespaceToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE } as WhitespaceToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_EOF } as TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles tab symbols or 4 consecutive whitespaces as indentation level', () => {
  let input = "    \n\t\n";

  let expected: HyperTextMarkerToken[] = [
    { kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION } as IndentationToken,
    { kind: HyperTextMarkerToken.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION } as IndentationToken,
    { kind: HyperTextMarkerToken.TOKEN_NEWLINE } as EndOfLineToken,
    { kind: HyperTextMarkerTokenTag.TOKEN_EOF } as TOKEN_EOF,
  ];

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})
