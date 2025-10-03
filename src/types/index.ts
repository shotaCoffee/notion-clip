// Notion configuration stored in Chrome storage
export interface NotionConfig {
  token: string
  databaseId: string
}

// Extracted article content from web page
export interface ExtractedContent {
  title: string
  content: string // HTML content from Readability
  markdown: string // Converted markdown
  url: string
  author?: string
  excerpt?: string
  publishedDate?: string
  siteName?: string
}

// Result of saving to Notion
export interface SaveResult {
  success: boolean
  pageId?: string
  error?: string
}

// Message types for communication between content script and background
export type MessageAction = 'extractContent' | 'saveToNotion'

export interface ExtractContentMessage {
  action: 'extractContent'
}

export interface ExtractContentResponse {
  success: boolean
  data?: ExtractedContent
  error?: string
}

export interface SaveToNotionMessage {
  action: 'saveToNotion'
  content: ExtractedContent
}

export interface SaveToNotionResponse {
  success: boolean
  pageId?: string
  error?: string
}
