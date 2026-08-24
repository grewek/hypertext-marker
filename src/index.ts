const INDENTATION_BLOCK_SIZE = 4;

export enum HyperTextMarkerTokenTag {
  TOKEN_UNKNOWN = "TOKEN_UNKNOWN",
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

function generate_whitespace_token(lexer: Lexer): HyperTextMarkerToken[] {
  const start = lexer.position;
  let end = lexer.position;

  while(!lexer_reached_eof(lexer)) {
    const next_character = lexer_peek_character(lexer);
    if(next_character == '\r' || next_character == '\n') {
      break;
    }

    if(is_whitespace(next_character)) {
      end += 1;
      lexer_advance(lexer);
    }
  }

  const length = end - start;

  const result: WhitespaceToken = {
    kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
    repeat_count: length,
    foldable: false,
    meta: {
      representation: lexer.source.slice(start, end),
      length: length,
      start: start,
      end: end,
    }
  }

  return result;
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


  const token: SymbolToken = {
    kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
    symbol: lexer.source[start],
    repeat_count: length,
    meta: {
      representation: lexer.source.slice(start, end),
      length: length,
      start: start,
      end: end,
    }
  }

  return token;
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
      const token: WhitespaceToken = {
        kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
        repeat_count: 1,
        foldable: true,
        meta: {
          representation: "\t",
          length: 1,
          start: lexer.position,
          end: lexer.position,
        }
      };

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
