import type { ExtractedContent, NotionConfig, SaveResult } from '../types'

export async function saveToNotion(
  content: ExtractedContent,
  config: NotionConfig
): Promise<SaveResult> {
  try {
    const blocks = markdownToBlocks(content.markdown)

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties: {
          Title: {
            title: [{ text: { content: content.title } }],
          },
          URL: {
            url: content.url,
          },
          'Saved Date': {
            date: { start: new Date().toISOString() },
          },
          ...(content.author && {
            Author: {
              rich_text: [{ text: { content: content.author } }],
            },
          }),
          ...(content.siteName && {
            'Site Name': {
              rich_text: [{ text: { content: content.siteName } }],
            },
          }),
        },
        children: blocks,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Notionへの保存に失敗しました',
      }
    }

    const result = await response.json()
    return {
      success: true,
      pageId: result.id,
    }
  } catch (error) {
    console.error('Failed to save to Notion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存に失敗しました',
    }
  }
}

// Convert markdown to Notion blocks (simplified version)
function markdownToBlocks(markdown: string): any[] {
  // Split by double newline to get paragraphs
  const paragraphs = markdown.split('\n\n').filter((p) => p.trim())

  // Limit to 100 blocks (Notion API constraint)
  return paragraphs.slice(0, 100).map((paragraph) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            // Limit to 2000 characters per block (Notion API constraint)
            content: paragraph.slice(0, 2000),
          },
        },
      ],
    },
  }))
}
