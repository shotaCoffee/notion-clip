import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// Custom rule: preserve links
turndownService.addRule('preserveLinks', {
  filter: 'a',
  replacement: (content, node) => {
    const href = (node as HTMLAnchorElement).getAttribute('href')
    return `[${content}](${href})`
  },
})

export function convertToMarkdown(html: string): string {
  try {
    return turndownService.turndown(html)
  } catch (error) {
    console.error('Failed to convert to markdown:', error)
    return html // Fallback to original HTML
  }
}
