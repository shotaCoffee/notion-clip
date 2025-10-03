import { Readability } from '@mozilla/readability'
import { convertToMarkdown } from '../utils/markdown'
import type {
  ExtractContentMessage,
  ExtractContentResponse,
  ExtractedContent,
} from '../types'

// Listen for messages from background script
chrome.runtime.onMessage.addListener(
  (
    message: ExtractContentMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtractContentResponse) => void
  ) => {
    if (message.action === 'extractContent') {
      try {
        // Clone the document for Readability
        const documentClone = document.cloneNode(true) as Document
        const reader = new Readability(documentClone)
        const article = reader.parse()

        if (!article) {
          sendResponse({
            success: false,
            error: 'Failed to extract content from page',
          })
          return
        }

        // Build extracted content
        const extracted: ExtractedContent = {
          title: article.title || document.title,
          content: article.content || '',
          markdown: '', // Will be filled below
          url: window.location.href,
          author: article.byline || undefined,
          excerpt: article.excerpt || undefined,
          publishedDate: article.publishedTime || undefined,
          siteName: article.siteName || undefined,
        }

        // Convert content to markdown
        extracted.markdown = convertToMarkdown(extracted.content)

        sendResponse({
          success: true,
          data: extracted,
        })
      } catch (error) {
        console.error('Content extraction error:', error)
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return true to indicate async response
    return true
  }
)

export {}
