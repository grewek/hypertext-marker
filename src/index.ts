const INDENTATION_BLOCK_SIZE = 4;

export enum HyperTextMarkerTokenTag {
  TOKEN_UNKNOWN = "TOKEN_UNKNOWN",
  TOKEN_IDENTIFIER = "TOKEN_IDENTIFIER",
  TOKEN_SYMBOL = "TOKEN_SYMBOL",
  TOKEN_WHITESPACE = "TOKEN_WHITESPACE",
  TOKEN_TAB = "TOKEN_TAB",
  TOKEN_NEWLINE = "TOKEN_NEWLINE",
  TOKEN_EOF = "TOKEN_EOF",
}

interface Lexer {
  source: string,
  position: number,
}

export interface UnknownToken {
  kind: HyperTextMarkerTokenTag.TOKEN_UNKNOWN,
  meta: TokenMetaData,
}

export interface IdentifierToken {
  kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
  meta: TokenMetaData,
}

export interface SymbolToken {
  kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
  symbol: string,
  repeat_count: number,
  meta: TokenMetaData,
}

export interface WhitespaceToken {
  kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
  repeat_count: number,
  foldable: boolean,
  meta: TokenMetaData
}

export interface EndOfLineToken {
  kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
  meta: TokenMetaData,
}

export interface EndOfFileToken {
  kind: HyperTextMarkerTokenTag.TOKEN_EOF,
  meta: TokenMetaData,
}

export interface TokenMetaData {
  representation: string,
  length: number,
  start: number,
  end: number,
}

export type HyperTextMarkerToken = 
  UnknownToken     |
  IdentifierToken  |
  SymbolToken      |
  WhitespaceToken  |
  EndOfLineToken   |
  EndOfFileToken;

function lexer_reached_eof(lexer: Lexer): boolean {
  return lexer.position >= lexer.source.length;
}

function lexer_advance(lexer: Lexer) {
    lexer.position += 1;
}

function lexer_peek_character(lexer: Lexer): string {
  return lexer.source[lexer.position] ?? "";
}

function lexer_peek_next_character(lexer: Lexer): string {
  return lexer.source[lexer.position + 1] ?? "";
}

function generate_whitespace_token(lexer: Lexer): HyperTextMarkerToken {
  const start = lexer.position;
  let end = lexer.position;

  while(!lexer_reached_eof(lexer)) {
    const next_character = lexer_peek_character(lexer);
    if(next_character == '\r' || next_character == '\n') {
      break;
    }

    if(is_whitespace(next_character)) {
      lexer_advance(lexer);
      end = lexer.position;
    } else {
      break;
    }
  }

  const result: WhitespaceToken = new_whitespace_token(lexer.source.slice(start, end), start, end);

  return result;
}

function generate_identifier_token(lexer: Lexer): HyperTextMarkerToken {
  const start = lexer.position;
  let end = lexer.position;

  while(!lexer_reached_eof(lexer)) {
    const character = lexer_peek_character(lexer);

    if(is_alphanumeric(character)) {
      lexer_advance(lexer);
      end = lexer.position;
    } else {
      break;
    }
  }

  const length = end - start;
  const result: IdentifierToken = {
    kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
    meta: {
      representation: lexer.source.slice(start, end),
      length: length,
      start: start,
      end: end,
    }
  }

  return result
}
function lexer_handle_symbol(lexer: Lexer): HyperTextMarkerToken {
  const start = lexer.position;
  let end = lexer.position;
  let whitespace_detected = false;

  const first_found_symbol = lexer_peek_character(lexer);

  while(!lexer_reached_eof(lexer)) {
    const next_character = lexer_peek_character(lexer);
    if(next_character === first_found_symbol) {
      lexer_advance(lexer);
      end = lexer.position;
    } else {
      break;
    }
  }

  const length = end - start;


  if(start >= lexer.source.length) {
    throw new Error("lexer position " + start + " out of range for a source with length " + lexer.source.length);
  } else {
    const result: SymbolToken = {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      symbol: lexer.source[start]!,
      repeat_count: length,
      meta: {
        representation: lexer.source.slice(start, end),
        length: length,
        start: start,
        end: end,
      }
    }
    return result;
  }
}

function new_whitespace_token(symbol: string, start: number, end: number): WhitespaceToken {
  if(start > end) {
    throw new Error("start > end cannot create token");
  }

  const is_foldable = symbol == '\t' ? true : false;
  const length = end - start;

  return {
    kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
    repeat_count: length <= 0 ? 1 : length,
    foldable: is_foldable,
    meta: {
      representation: symbol,
      length: length <= 0 ? 1 : length,
      start: start,
      end: end,
    }
  }
}

export enum HyperTextBlockTag {
  HEADING_BLOCK = "HEADING_BLOCK",
  PARAGRAPH_BLOCK = "PARAGRAPH_BLOCK",
}

export interface HyperTextMarkerHeadingBlock {
  kind: HyperTextBlockTag.HEADING_BLOCK,
  depth: number,
  contained: HyperTextMarkerToken[]
}

export interface HyperTextMarkerParagraphBlock {
  kind: HyperTextBlockTag.PARAGRAPH_BLOCK,
  contained: HyperTextMarkerToken[],
}

export interface HyperTextMarkerParser {
  tokens: HyperTextMarkerToken[],
  position: number,
}

export type HyperTextMarkerBlock = HyperTextMarkerHeadingBlock | HyperTextMarkerParagraphBlock;

function parser_parse_heading(parser: HyperTextMarkerParser, depth: number): HyperTextMarkerHeadingBlock {

  const result: HyperTextMarkerHeadingBlock = {
    kind: HyperTextBlockTag.HEADING_BLOCK,
    depth: depth,
    contained: [],
  }

  while(!parser_reached_eof(parser) && !parser_match_tokens(parser, [HyperTextMarkerTokenTag.TOKEN_NEWLINE])) {
    const token = parser.tokens[parser.position];
    if(token === undefined) {
      throw new Error("Tried to access invalid token");
    }
    result.contained.push(token);
    parser_advance(parser);
  }

  return result;
}

function parser_reached_eof(parser: HyperTextMarkerParser): boolean {
  return parser.position >= parser.tokens.length;
}

function parser_advance(parser: HyperTextMarkerParser) {
  parser.position += 1;
}

function parser_peek_token_type(parser: HyperTextMarkerParser): HyperTextMarkerTokenTag {
  if(parser.position <= parser.tokens.length - 1) {
    return parser.tokens[parser.position + 1]!.kind;
  } else {
    return HyperTextMarkerTokenTag.TOKEN_EOF;
  }
}

function parser_match_tokens(parser: HyperTextMarkerParser, tokens_to_match: HyperTextMarkerTokenTag[]): boolean {
  const token  = parser.tokens[parser.position];
  if(token === undefined) {
    return false;
  }

  for(let i = 0; i < tokens_to_match.length; i++) {
    if(token.kind == tokens_to_match[i]) {
      return true;
    }
  }

  return false;
}

//TODO: The whole api is wishful thinking right now!
function parse_blocks(parser: HyperTextMarkerParser): HyperTextMarkerBlock[] {
  let result: HyperTextMarkerBlock[] = []

  while(!parser_reached_eof(parser)) {
    if(parser_match_tokens(parser, [HyperTextMarkerTokenTag.TOKEN_SYMBOL])) {
      const token = parser.tokens[parser.position];

      if(token === undefined) {
        throw new Error("Tried to access invalid token");
      }

      if(token.kind == HyperTextMarkerTokenTag.TOKEN_SYMBOL && token.symbol == '#' && parser_peek_token_type(parser) == HyperTextMarkerTokenTag.TOKEN_WHITESPACE) {
        parser_advance(parser);
        const whitespace_token = parser.tokens[parser.position];

        console.log(whitespace_token);
        if(whitespace_token === undefined) {
          throw new Error("Tried to access invalid token");
        }

        if(whitespace_token.kind == HyperTextMarkerTokenTag.TOKEN_WHITESPACE && whitespace_token.repeat_count == 1 && !whitespace_token.foldable) {
          parser_advance(parser);
          const parsed_heading = parser_parse_heading(parser, token.meta.length);
          result.push(parsed_heading);
        }
      } else {
        throw new Error("unknown element or unhandled case!");
      }
    }
  }

  return result;
}

export function parse(tokens: HyperTextMarkerToken[]): HyperTextMarkerBlock[] {
  const parser: HyperTextMarkerParser = {
    tokens: tokens,
    position: 0,
  }
  const parsed_blocks = parse_blocks(parser);

  return parsed_blocks;
}

export function tokenize(source: string): HyperTextMarkerToken[] {
  let lexer: Lexer = {
    source: source,
    position: 0,
  }

  let result: HyperTextMarkerToken[] = []

  while(!lexer_reached_eof(lexer)) {
    const next_character = lexer_peek_character(lexer);

    //NOTE: Windows uses \r\n so we just consume the \r and react on \n
    if(next_character == '\r') { 
      lexer_advance(lexer);
    }
    else if(next_character == '\t') {
      const token = new_whitespace_token('\t', lexer.position, lexer.position);
      result.push(token);
      lexer_advance(lexer);
    }
    else if(next_character == '\n') {
      const new_line_token: EndOfLineToken = {
        kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
        meta: {
          representation: '\n',
          length: 1,
          start: lexer.position,
          end: lexer.position,
        }
      }
      result.push(new_line_token);
      lexer_advance(lexer);
    } 
    else if(is_alphanumeric(next_character)) {
      const generated_token = generate_identifier_token(lexer);
      result.push(generated_token);
    }
    else if(is_whitespace(next_character)) {
      const generated_token = generate_whitespace_token(lexer)
      result.push(generated_token);
    } 
    else if (is_symbol(next_character)) {
      const generated_token = lexer_handle_symbol(lexer);
      result.push(generated_token);
    }
    else {
      lexer_advance(lexer)
    }
    
  }

  const token: EndOfFileToken = {
    kind: HyperTextMarkerTokenTag.TOKEN_EOF,
    meta: {
      representation: "",
      length: 1,
      start: lexer.position,
      end: lexer.position,
    }
  }


  result.push(token);
  return result;
}

function is_whitespace(c: string): boolean {
  return c.trim() === "";
}

function is_alpha(c: string): boolean {
  return /^\p{L}$/u.test(c);
}

function is_digit(c: string): boolean {
  return /^\p{N}$/u.test(c);
}

function is_symbol(c: string): boolean {
  return /^[\p{S}\p{P}]$/u.test(c);
}

function is_alphanumeric(c: string): boolean {
  return /^[\p{L}\p{N}]$/u.test(c);
}
