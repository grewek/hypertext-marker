export enum HyperTextMarkerToken {
  TOKEN_WHITESPACE,
  TOKEN_INDENTATION,
  TOKEN_STAR_SYMBOL,
  TOKEN_NEWLINE,
  TOKEN_EOF,
}

interface Lexer {
  source: string,
  position: number,
}

function lexer_reached_eof(lexer: Lexer): boolean {
  return lexer.position >= lexer.source.length;
}

function lexer_advance(lexer: Lexer) {
    lexer.position += 1;
}

function lexer_peek_character(lexer: Lexer): string {
  return lexer.source[lexer.position] ?? "";
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
  const symbol_count = Math.floor(length / 4);
  for(let i = 0; i < symbol_count; i++) {
    tokens.push(HyperTextMarkerToken.TOKEN_INDENTATION);
  }

  //NOTE: Add Whitespace tokens that were not consume by the previous operation
  let rest = length - (symbol_count * 4);
  for(let i = 0; i < rest; i++) {
    tokens.push(HyperTextMarkerToken.TOKEN_WHITESPACE);
  }

  return tokens;
}

function lexer_generate_whitespace_token(): HyperTextMarkerToken {
  return HyperTextMarkerToken.TOKEN_EOF;
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
      result.push(HyperTextMarkerToken.TOKEN_INDENTATION);
      lexer_advance(lexer);
    }
    else if(next_character == '\n') {
      result.push(HyperTextMarkerToken.TOKEN_NEWLINE)
      lexer_advance(lexer);
    } 
    else if(is_whitespace(next_character)) {
      const generated_tokens = generate_whitespace_token(lexer)
      result = [... generated_tokens];
    } 
    else {
      lexer_advance(lexer);
    }
    
  }

  result.push(HyperTextMarkerToken.TOKEN_EOF);
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
