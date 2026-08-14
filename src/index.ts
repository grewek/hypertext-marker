interface Lexer {
  position: number,
  source: string,
}

function advance(lexer: Lexer): boolean {
  if (lexer.position >= lexer.source.length) {
    return false;
  } else {
    lexer.position += 1;
    return true;
  }
}

function peek_character(lexer: Lexer): string {
  const next_character = lexer.source[lexer.position];

  if(next_character == undefined) {
    return ""
  } else {
    return next_character;
  }
}

function parse_symbol_token(lexer: Lexer): Token {
  const start = lexer.position;
  let end = lexer.position;

  while(advance(lexer)) {
    const current_symbol = peek_character(lexer);

    if(is_symbol(current_symbol) && lexer.source[start] === current_symbol) {
      end += 1;
    } else {
      break;
    }
  }

  return new_symbolic_token(lexer.source, start, end);
}

enum MarkdownTokenType {
  THEMATIC_BREAK,
  UNKNOWN,
}

interface Token {
  type: MarkdownTokenType,
  representation: string,
  position_start: number,
  position_end: number,
  length: number
}

function new_symbolic_token(source: string, start: number, end: number): Token {
  const representation = source.slice(start, end + 1);
  if(representation.length === 3) {
    return {
      type: MarkdownTokenType.THEMATIC_BREAK,
      representation: representation,
      position_start: start,
      position_end: end,
      length: (end - start) + 1
    }
  } else {
    return {
      type: MarkdownTokenType.UNKNOWN,
      representation: representation,
      position_start: start,
      position_end: end,
      length: (end - start) + 1,
    }
  }
}


export function transpile_md_to_html(source: string, pretty: boolean): string {
  let token_pool: Token[] = [];
  const lexer: Lexer = {
    position: 0,
    source: source,
  }

  while(lexer.position < lexer.source.length) {
    const current_symbol = peek_character(lexer);

    if(is_whitespace(current_symbol)) {
      advance(lexer);
    }
    else if(is_symbol(current_symbol)) {
      token_pool.push(parse_symbol_token(lexer));
    }
  }

  let html_output: string = "";
  for(let i = 0; i < token_pool.length; i++) {
    if(token_pool[i].type == MarkdownTokenType.THEMATIC_BREAK) {
      html_output += "<hr/>"
    }
  }

  return html_output;
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
