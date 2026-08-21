export enum HyperTextMarkerTokenTag {
  TOKEN_HEADING = "TOKEN_HEADING",
  TOKEN_UNKNOWN = "TOKEN_UNKNOWN",
  TOKEN_SYMBOL = 'TOKEN_SYMBOL',
  TOKEN_WHITESPACE = "TOKEN_WHITESPACE",
  TOKEN_INDENTATION = "TOKEN_INDENTATION",
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

export interface HeadingToken {
  kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
  depth: number,
  meta: TokenMetaData,
}

export interface SymbolToken {
  kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
  meta: TokenMetaData,
}

export interface WhitespaceToken {
  kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
  meta: TokenMetaData
}

export interface IndentationToken {
  kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION,
  meta: TokenMetaData,
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
  HeadingToken     |
  SymbolToken      |
  WhitespaceToken  |
  IndentationToken |
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
  let tokens: HyperTextMarkerToken[] = [];

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

  //NOTE: Add Indentation Tokens
  const indentation_block_count = Math.floor(length / 4);

  for(let i = 0; i < indentation_block_count; i++) {
    const token: IndentationToken = {
      kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION,
      meta: {
        representation: lexer.source.slice(indentation_block_count * i, indentation_block_count * i + 4),
        //TODO: We need to calculate the correct start and end of the indentation blocks!
        length: 4,
        start: start + (indentation_block_count * i),
        end: (start + (indentation_block_count * i) + 4) - 1,
      }
    }
    tokens.push(token);
  }

  //NOTE: Add Whitespace tokens that were not consumed by the previous operation
  let rest = length - (indentation_block_count * 4);
  for(let i = 0; i < rest; i++) {
    const token: WhitespaceToken = {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      meta: {
        representation: " ",
        //TODO: We need to calculate the correct start and end of the indentation blocks!
        length: 1,
        start: (indentation_block_count * 4) + i,
        end: (indentation_block_count * 4) + i,
      }
    }
    tokens.push(token);
  }

  return tokens;
}

function lexer_handle_possible_heading(lexer: Lexer): HyperTextMarkerToken {
  const start = lexer.position;
  let end = lexer.position;
  let whitespace_detected = false;

  while(!lexer_reached_eof(lexer)) {
    let next_character = lexer_peek_next_character(lexer);
    if(next_character == '#') {
      lexer_advance(lexer);
      end = lexer.position;
    } else {
      next_character = lexer_peek_next_character(lexer);
      if((next_character != '\n' && next_character != '\r') && is_whitespace(next_character)) {
        whitespace_detected = true;
      }

      lexer_advance(lexer);
      end = lexer.position;
      break;
    }
  }

  const length = end - start;
  if ((length >= 1 && length <= 6) && whitespace_detected == true) {
    const token: HeadingToken = {
      kind: HyperTextMarkerTokenTag.TOKEN_HEADING,
      depth: length,
      meta: {
        representation: lexer.source.slice(start, end),
        length: length,
        start: start,
        end: end - 1,
      }
    };

    return token;
  }

  const token: SymbolToken = {
    kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
    meta: {
      representation: lexer.source,
      length: 1,
      start: start,
      end: end,
    }
  }

  return token;
}
function lexer_handle_symbol(lexer: Lexer): HyperTextMarkerToken {
  switch(lexer_peek_character(lexer)) {
    case '#': {
      return lexer_handle_possible_heading(lexer);
    }
    default: {
      const token: SymbolToken = {
        kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
        meta: {
          representation: lexer.source,
          length: 1,
          start: lexer.position,
          end: lexer.position + 1,
        }
      }

      return token;
    }
  }
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
      const token: IndentationToken = {
        kind: HyperTextMarkerTokenTag.TOKEN_INDENTATION,
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
      const generated_tokens = generate_whitespace_token(lexer)
      result = [...result, ...generated_tokens];
    } 
    else if (is_symbol(next_character)) {
      const generated_token = lexer_handle_symbol(lexer);
      result.push(generated_token);
      lexer_advance(lexer);
    }
    else {
      lexer_advance(lexer);
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
