import { isRequiredPolyfill } from '../option'

// Based on the original line-number rendering rule of VS Code.
// https://github.com/microsoft/vscode/blob/5466f27d95c52e8d7c34ed445c682b5d71f049d9/extensions/markdown-language-features/src/markdownEngine.ts#L102-L104

const rules = [
  'marpit_slide_open', // Marpit's <section> tag (<svg> cannot assign className)
  'paragraph_open',
  'heading_open',
  'image',
  'code_block',
  'fence',
  'blockquote_open',
  'list_item_open',
]

export default function marpVSCodeLineNumber(md) {
  const { marpit_inline_svg_open } = md.renderer.rules

  if (isRequiredPolyfill) {
    // Enable line sync by per slides
    // (<svg> does not affect by the transformed position)
    md.renderer.rules.marpit_inline_svg_open = (tokens, i, opts, env, self) => {
      const slide = tokens
        .slice(i + 1)
        .find(t => t.type === 'marpit_slide_open')

      if (slide.map && slide.map.length) {
        tokens[i].attrJoin('class', 'code-line')
        tokens[i].attrSet('data-line', slide.map[0])
      }

      const renderer = marpit_inline_svg_open || self.renderToken
      return renderer.call(self, tokens, i, opts, env, self)
    }
  } else {
    // Enables better line sync only when disabled polyfill
    // (There are wrong DOM positions if enabled polyfill)
    for (const rule of rules) {
      const original = md.renderer.rules[rule]

      md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
        const token = tokens[idx]

        if (token.map && token.map.length) {
          token.attrJoin('class', 'code-line')
          token.attrSet('data-line', token.map[0])
        }

        const renderer = original || self.renderToken
        return renderer.call(self, tokens, idx, options, env, self)
      }
    }
  }
}
