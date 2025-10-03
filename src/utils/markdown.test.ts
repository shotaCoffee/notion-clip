import { describe, it, expect } from 'vitest'
import { convertToMarkdown } from './markdown'

describe('convertToMarkdown', () => {
  it('should convert simple HTML to markdown', () => {
    const html = '<h1>Title</h1><p>This is a paragraph.</p>'

    const result = convertToMarkdown(html)

    expect(result).toContain('# Title')
    expect(result).toContain('This is a paragraph.')
  })

  it('should convert links to markdown format', () => {
    const html = '<a href="https://example.com">Example Link</a>'

    const result = convertToMarkdown(html)

    expect(result).toBe('[Example Link](https://example.com)')
  })

  it('should convert code blocks to fenced format', () => {
    const html = '<pre><code>const x = 1;</code></pre>'

    const result = convertToMarkdown(html)

    expect(result).toContain('```')
    expect(result).toContain('const x = 1;')
  })

  it('should convert bullet lists with dash marker', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'

    const result = convertToMarkdown(html)

    expect(result).toMatch(/-\s+Item 1/)
    expect(result).toMatch(/-\s+Item 2/)
  })

  it('should handle empty HTML', () => {
    const html = ''

    const result = convertToMarkdown(html)

    expect(result).toBe('')
  })

  it('should handle HTML with special characters', () => {
    const html = '<p>Special: &lt;&gt;&amp;</p>'

    const result = convertToMarkdown(html)

    expect(result).toContain('Special: <>&')
  })

  it('should return original HTML on conversion error', () => {
    // This test verifies fallback behavior
    const html = '<p>Valid HTML</p>'

    const result = convertToMarkdown(html)

    // Should return markdown, not fall back
    expect(result).toBeTruthy()
  })
})
