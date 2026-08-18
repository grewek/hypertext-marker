export enum HyperTextMarkerToken {
  TOKEN_HEADING_H1,
  TOKEN_HEADING_H2,
  TOKEN_HEADING_H3,
  TOKEN_HEADING_H4,
  TOKEN_HEADING_H5,
  TOKEN_HEADING_H6,
  TOKEN_UNKNOWN,
  TOKEN_SYMBOL_HASH_SIGN,
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
      if((next_character != '\n' || next_character != '\r') && is_whitespace(next_character)) {
        whitespace_detected = true;
      }

      lexer_advance(lexer);
      break;
    }
  }

  const length = (end - start) + 1;

  if ((length >= 1 && length <= 6) && whitespace_detected == true) {
    //TODO: Hidden beyond this switch is an abstraction, but this requires us to use union types instead of
    //      raw enums, and i will get to this point but right now isn't the time to fix this __yet__
    switch(length) {
      case 1: {
        return HyperTextMarkerToken.TOKEN_HEADING_H1
      }
      case 2: {
        return HyperTextMarkerToken.TOKEN_HEADING_H2
      }
      case 3: {
        return HyperTextMarkerToken.TOKEN_HEADING_H3
      }
      case 4: {
        return HyperTextMarkerToken.TOKEN_HEADING_H4
      }
      case 5: {
        return HyperTextMarkerToken.TOKEN_HEADING_H5
      }
      case 6: {
        return HyperTextMarkerToken.TOKEN_HEADING_H6
      }
      default: {
      }
    }
  }

  return HyperTextMarkerToken.TOKEN_SYMBOL_HASH_SIGN
}
function lexer_handle_symbol(lexer: Lexer): HyperTextMarkerToken {
  switch(lexer_peek_character(lexer)) {
    case '#': {
      return lexer_handle_possible_heading(lexer);
      break;
    }
    default: {
      return HyperTextMarkerToken.TOKEN_UNKNOWN;
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
    else if (is_symbol(next_character)) {
      
      const generated_token = lexer_handle_symbol(lexer);
      result.push(generated_token);
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
