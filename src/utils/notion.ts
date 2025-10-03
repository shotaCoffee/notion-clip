import type { ExtractedContent, NotionConfig, SaveResult } from '../types'

// Notion Block Types
type NotionBlock =
  | HeadingBlock
  | ParagraphBlock
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | ImageBlock

type HeadingBlock = {
  object: 'block'
  type: 'heading_1' | 'heading_2' | 'heading_3'
  heading_1?: { rich_text: RichText[] }
  heading_2?: { rich_text: RichText[] }
  heading_3?: { rich_text: RichText[] }
}

type ParagraphBlock = {
  object: 'block'
  type: 'paragraph'
  paragraph: { rich_text: RichText[] }
}

type BulletedListItemBlock = {
  object: 'block'
  type: 'bulleted_list_item'
  bulleted_list_item: { rich_text: RichText[] }
}

type NumberedListItemBlock = {
  object: 'block'
  type: 'numbered_list_item'
  numbered_list_item: { rich_text: RichText[] }
}

type CodeBlock = {
  object: 'block'
  type: 'code'
  code: { rich_text: RichText[]; language: string }
}

type ImageBlock = {
  object: 'block'
  type: 'image'
  image: { type: 'external'; external: { url: string } }
}

type RichText = {
  type: 'text'
  text: { content: string; link?: { url: string } }
  annotations?: {
    bold?: boolean
    italic?: boolean
    code?: boolean
  }
}

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

// Convert markdown to Notion blocks with rich formatting
function markdownToBlocks(markdown: string): NotionBlock[] {
  const lines = markdown.split('\n')
  const blocks: NotionBlock[] = []
  let i = 0

  while (i < lines.length && blocks.length < 100) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      i++
      continue
    }

    // Heading 1
    if (line.startsWith('# ')) {
      blocks.push(createHeadingBlock(1, line.substring(2)))
      i++
      continue
    }

    // Heading 2
    if (line.startsWith('## ')) {
      blocks.push(createHeadingBlock(2, line.substring(3)))
      i++
      continue
    }

    // Heading 3
    if (line.startsWith('### ')) {
      blocks.push(createHeadingBlock(3, line.substring(4)))
      i++
      continue
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(createCodeBlock(codeLines.join('\n')))
      i++
      continue
    }

    // Bulleted list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push(createBulletedListBlock(line.substring(2)))
      i++
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      blocks.push(createNumberedListBlock(line.replace(/^\d+\.\s/, '')))
      i++
      continue
    }

    // Image (markdown format: ![alt](url))
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    if (imageMatch) {
      blocks.push(createImageBlock(imageMatch[2]))
      i++
      continue
    }

    // Default: paragraph with rich text parsing
    blocks.push(createParagraphBlock(line))
    i++
  }

  return blocks
}

function createHeadingBlock(level: 1 | 2 | 3, text: string): HeadingBlock {
  const type = `heading_${level}` as 'heading_1' | 'heading_2' | 'heading_3'
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: parseRichText(text),
    },
  } as HeadingBlock
}

function createParagraphBlock(text: string): ParagraphBlock {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: parseRichText(text),
    },
  }
}

function createBulletedListBlock(text: string): BulletedListItemBlock {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: parseRichText(text),
    },
  }
}

function createNumberedListBlock(text: string): NumberedListItemBlock {
  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: parseRichText(text),
    },
  }
}

function createCodeBlock(code: string): CodeBlock {
  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [
        {
          type: 'text',
          text: { content: code.slice(0, 2000) },
        },
      ],
      language: 'plain text',
    },
  }
}

function createImageBlock(url: string): ImageBlock {
  return {
    object: 'block',
    type: 'image',
    image: {
      type: 'external',
      external: { url },
    },
  }
}

// Parse rich text with bold, italic, code, and links
function parseRichText(text: string): RichText[] {
  const richText: RichText[] = []
  const remaining = text.slice(0, 2000) // Notion API limit

  // Simple regex-based parsing for markdown inline formatting
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const boldRegex = /\*\*([^*]+)\*\*/g
  const italicRegex = /_([^_]+)_/g
  const inlineCodeRegex = /`([^`]+)`/g

  let lastIndex = 0
  const parts: Array<{ start: number; end: number; type: string; content: string; url?: string }> =
    []

  // Extract links
  let match
  while ((match = linkRegex.exec(remaining)) !== null) {
    parts.push({
      start: match.index,
      end: linkRegex.lastIndex,
      type: 'link',
      content: match[1],
      url: match[2],
    })
  }

  // Extract bold
  boldRegex.lastIndex = 0
  while ((match = boldRegex.exec(remaining)) !== null) {
    parts.push({ start: match.index, end: boldRegex.lastIndex, type: 'bold', content: match[1] })
  }

  // Extract italic
  italicRegex.lastIndex = 0
  while ((match = italicRegex.exec(remaining)) !== null) {
    parts.push({
      start: match.index,
      end: italicRegex.lastIndex,
      type: 'italic',
      content: match[1],
    })
  }

  // Extract inline code
  inlineCodeRegex.lastIndex = 0
  while ((match = inlineCodeRegex.exec(remaining)) !== null) {
    parts.push({
      start: match.index,
      end: inlineCodeRegex.lastIndex,
      type: 'code',
      content: match[1],
    })
  }

  // If no formatting found, return plain text
  if (parts.length === 0) {
    return [{ type: 'text', text: { content: remaining } }]
  }

  // Sort by start position
  parts.sort((a, b) => a.start - b.start)

  // Build rich text array
  parts.forEach(part => {
    // Add plain text before this part
    if (part.start > lastIndex) {
      const plainText = remaining.substring(lastIndex, part.start)
      richText.push({ type: 'text', text: { content: plainText } })
    }

    // Add formatted text
    if (part.type === 'link' && part.url) {
      richText.push({
        type: 'text',
        text: { content: part.content, link: { url: part.url } },
      })
    } else if (part.type === 'bold') {
      richText.push({
        type: 'text',
        text: { content: part.content },
        annotations: { bold: true },
      })
    } else if (part.type === 'italic') {
      richText.push({
        type: 'text',
        text: { content: part.content },
        annotations: { italic: true },
      })
    } else if (part.type === 'code') {
      richText.push({
        type: 'text',
        text: { content: part.content },
        annotations: { code: true },
      })
    }

    lastIndex = part.end
  })

  // Add remaining plain text
  if (lastIndex < remaining.length) {
    richText.push({ type: 'text', text: { content: remaining.substring(lastIndex) } })
  }

  return richText.length > 0 ? richText : [{ type: 'text', text: { content: remaining } }]
}
