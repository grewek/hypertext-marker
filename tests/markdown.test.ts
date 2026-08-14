import { expect, test } from 'vitest'
import { transpile_md_to_html } from '../src/index.ts'

test('the transpilation process can handle "thematic breaks" like `***`, `---` or `___`', () => {
  let input: string = "***\n---\n___\n";
  let expected: string = "<hr/><hr/><hr/>"

  let result = transpile_md_to_html(input, false);
  expect(result).toBe(expected);
})
