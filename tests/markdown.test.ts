import { expect, test } from 'vitest'
import { HyperTextMarkerToken, UnknownToken, SymbolToken, 
  HeadingToken, WhitespaceToken, IndentationToken, 
  TokenEndOfFile, HyperTextMarkerTokenTag, EndOfLineToken,
  tokenize, parse, transpile_md_to_html, HyperTextBlockTag, 
  HyperTextMarkerHeadingBlock, HyperTextParagraphBlock, 
  HyperTextMarkerBlock  } from '../src/index.ts'

test('the basic tokens are parsed into blocks containing sub tokens', () => {
  const input = "# this is a block"

  const expected = [
    {
      kind: HyperTextBlockTag.HEADING_BLOCK,
      depth: 1,
      childs: [],
      contained: [
        {
          kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
          meta: {
            representation: "this",
            length: "this".length,
            start: "# ".length,
            end: "# this".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
          repeat_count: 1,
          foldable: false,
          meta: {
            representation: " ",
            length: 1,
            start: "# this".length,
            end: "# this ".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
          meta: {
            representation: "is",
            length: "is".length,
            start: "# this ".length,
            end: "# this is".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
          repeat_count: 1,
          foldable: false,
          meta: {
            representation: " ",
            length: 1,
            start: "# this is".length,
            end: "# this is ".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
          meta: {
            representation: "a",
            length: "a".length,
            start: "# this is ".length,
            end: "# this is a".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
          repeat_count: 1,
          foldable: false,
          meta: {
            representation: " ",
            length: 1,
            start: "# this is a".length,
            end: "# this is a ".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
          meta: {
            representation: "block",
            length: "block".length,
            start: "# this is a ".length,
            end: "# this is a block".length,
          }
        },
        {
          kind: HyperTextMarkerTokenTag.TOKEN_EOF,
          meta: {
            representation: "",
            length: 1,
            start: "# this is a block".length,
            end: "# this is a block".length,
          }
        }
      ]
    }
  ]

  const tokens = tokenize(input);
  const result = parse(tokens);

  expect(result).toStrictEqual(expected);
})
test('the lexer handles symbols, text and newlines', () => {
  const input = "this\nis normal text\n# mixed with symbols\n\t";
  const expected = [
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "this",
        length: "this".length,
        start: 0,
        end: "this".length
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: "this".length,
        end: "this".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "is",
        length: "is".length,
        start: "this\n".length,
        end: "this\nis".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: " ".length,
        start: "this\nis".length,
        end: "this\nis ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "normal",
        length: "normal".length,
        start: "this\nis ".length,
        end: "this\nis normal".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: 1,
        start: "this\nis normal".length,
        end: "this\nis normal ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "text",
        length: "text".length,
        start: "this\nis normal ".length,
        end: "this\nis normal text".length
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta: {
        representation: "\n",
        length: 1,
        start: "this\nis normal text".length,
        end: "this\nis normal text".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_SYMBOL,
      repeat_count: 1,
      symbol: "#",
      meta: {
        representation: "#",
        length: 1,
        start: "this\nis normal text\n".length,
        end: "this\nis normal text\n#".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: 1,
        start: "this\nis normal text\n#".length,
        end: "this\nis normal text\n# ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "mixed",
        length: "mixed".length,
        start: "this\nis normal text\n# ".length,
        end: "this\nis normal text\n# mixed".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: 1,
        start: "this\nis normal text\n# mixed".length,
        end: "this\nis normal text\n# mixed ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "with",
        length: "with".length,
        start: "this\nis normal text\n# mixed ".length,
        end: "this\nis normal text\n# mixed with".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: 1,
        start: "this\nis normal text\n# mixed with".length,
        end: "this\nis normal text\n# mixed with ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "symbols",
        length: "symbols".length,
        start: "this\nis normal text\n# mixed with ".length,
        end: "this\nis normal text\n# mixed with symbols".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_NEWLINE,
      meta:  {
        representation: "\n",
        length: 1,
        start: "this\nis normal text\n# mixed with symbols".length,
        end: "this\nis normal text\n# mixed with symbols".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: true,
      meta: {
        representation: "\t",
        length: 1,
        start: "this\nis normal text\n# mixed with symbols\n".length,
        end: "this\nis normal text\n# mixed with symbols\n".length,
      }
    }, 
    {
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        length: 1,
        start: "this\nis normal text\n# mixed with symbols\n\t".length,
        end: "this\nis normal text\n# mixed with symbols\n\t".length,
      }
    }
  ]

  let result = tokenize(input);
  expect(result).toStrictEqual(expected);
})
test('the lexer handles normal text as identifiers', () => {
  const input = "this is normal text";
  const expected = [
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "this",
        length: "this".length,
        start: 0,
        end: "this".length
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: " ".length,
        start: "this".length,
        end: "this ".length
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "is",
        length: "is".length,
        start: "this ".length,
        end: "this is".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: " ".length,
        start: "this is".length,
        end: "this is ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "normal",
        length: "normal".length,
        start: "this is ".length,
        end: "this is normal".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_WHITESPACE,
      repeat_count: 1,
      foldable: false,
      meta: {
        representation: " ",
        length: " ".length,
        start: "this is normal".length,
        end: "this is normal ".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_IDENTIFIER,
      meta: {
        representation: "text",
        length: "text".length,
        start: "this is normal ".length,
        end: "this is normal text".length,
      }
    },
    {
      kind: HyperTextMarkerTokenTag.TOKEN_EOF,
      meta: {
        representation: "",
        length: 1,
        start: "this is normal text".length,
        end: "this is normal text".length,
      }
    }
  ]

  const result = tokenize(input);
  expect(result).toStrictEqual(expected);
});

test('the lexer handles atx-heading indicators', () => {
  const input = "#\n##\n###\n####\n#####\n######"
  const expected: HyperTextMarkerToken[] = [
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

  const result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles whitespace as token and does not ignore it', () => {
  const input = "   ";
  const expected: HyperTextMarkerToken[] = [
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

  const result = tokenize(input);
  expect(result).toStrictEqual(expected);
})

test('the lexer handles tab symbols or 4 consecutive whitespaces as indentation level', () => {
  const input = "    \n\t\n";

  const expected: HyperTextMarkerToken[] = [
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

  const result = tokenize(input);
  expect(result).toStrictEqual(expected);
})
