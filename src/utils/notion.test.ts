import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveToNotion } from './notion'
import type { ExtractedContent, NotionConfig } from '../types'

// Mock global fetch
global.fetch = vi.fn()

describe('notion utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveToNotion', () => {
    it('should save extracted content to Notion', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id-123' }),
      })
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Test Article',
        content: '<p>Article content</p>',
        markdown: '# Test Article\n\nArticle content',
        url: 'https://example.com/article',
        author: 'John Doe',
        siteName: 'Example Site',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      const result = await saveToNotion(content, config)

      expect(result.success).toBe(true)
      expect(result.pageId).toBe('page-id-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
        })
      )
    })

    it('should include title, URL, and saved date properties', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Test Article',
        content: '<p>Content</p>',
        markdown: 'Content',
        url: 'https://example.com/test',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await saveToNotion(content, config)

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.properties.Title.title[0].text.content).toBe('Test Article')
      expect(body.properties.URL.url).toBe('https://example.com/test')
      expect(body.properties['Saved Date'].date.start).toBeDefined()
    })

    it('should include author and site name when available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Article',
        content: '<p>Content</p>',
        markdown: 'Content',
        url: 'https://example.com',
        author: 'Jane Doe',
        siteName: 'Tech Blog',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await saveToNotion(content, config)

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.properties.Author.rich_text[0].text.content).toBe('Jane Doe')
      expect(body.properties['Site Name'].rich_text[0].text.content).toBe(
        'Tech Blog'
      )
    })

    it('should convert markdown to Notion blocks', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Test',
        content: '<p>Content</p>',
        markdown: 'Paragraph 1\n\nParagraph 2',
        url: 'https://example.com',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await saveToNotion(content, config)

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.children).toBeDefined()
      expect(Array.isArray(body.children)).toBe(true)
      expect(body.children.length).toBeGreaterThan(0)
    })

    it('should return error when save fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      })
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Test',
        content: '<p>Content</p>',
        markdown: 'Content',
        url: 'https://example.com',
      }

      const config: NotionConfig = {
        token: 'invalid-token',
        databaseId: 'test-db-id',
      }

      const result = await saveToNotion(content, config)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      const content: ExtractedContent = {
        title: 'Test',
        content: '<p>Content</p>',
        markdown: 'Content',
        url: 'https://example.com',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      const result = await saveToNotion(content, config)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('should limit blocks to Notion API constraints', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-id' }),
      })
      global.fetch = mockFetch

      // Create very long markdown with many paragraphs
      const longMarkdown = Array.from(
        { length: 150 },
        (_, i) => `Paragraph ${i + 1}`
      ).join('\n\n')

      const content: ExtractedContent = {
        title: 'Long Article',
        content: '<p>Content</p>',
        markdown: longMarkdown,
        url: 'https://example.com',
      }

      const config: NotionConfig = {
        token: 'test-token',
        databaseId: 'test-db-id',
      }

      await saveToNotion(content, config)

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      // Notion API limit: max 100 blocks
      expect(body.children.length).toBeLessThanOrEqual(100)
    })
  })
})
