import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
})

// Custom rule: preserve links
turndownService.addRule('preserveLinks', {
  filter: 'a',
  replacement: (content, node) => {
    const href = (node as HTMLAnchorElement).getAttribute('href')
    if (!href || !content.trim()) return content
    return `[${content}](${href})`
  },
})

// Remove unnecessary whitespace and clean up
turndownService.addRule('removeExtraWhitespace', {
  filter: ['div', 'span'],
  replacement: (content) => content,
})

export function convertToMarkdown(html: string): string {
  try {
    const markdown = turndownService.turndown(html)
    // Clean up: remove excessive blank lines (max 2 consecutive)
    return markdown.replace(/\n{3,}/g, '\n\n').trim()
  } catch (error) {
    console.error('Failed to convert to markdown:', error)
    return html // Fallback to original HTML
  }
}
