import { saveToNotion } from '../utils/notion'
import { getNotionConfig } from '../utils/storage'
import type {
  ExtractedContent,
  ExtractContentMessage,
  ExtractContentResponse,
} from '../types'

// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToNotion',
    title: 'Notionに保存',
    contexts: ['page'],
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === 'saveToNotion' && tab?.id) {
      try {
      // Send message to content script to extract content
      const message: ExtractContentMessage = { action: 'extractContent' }
      const response = (await chrome.tabs.sendMessage(
        tab.id,
        message
      )) as ExtractContentResponse

      if (!response.success) {
        showNotification(
          'エラー',
          response.error || '本文の抽出に失敗しました'
        )
        return
      }

      const extracted: ExtractedContent = response.data!

      // Get Notion configuration
      const config = await getNotionConfig()
      if (!config) {
        showNotification('エラー', 'Notion設定が必要です')
        return
      }

      // Save to Notion
      const result = await saveToNotion(extracted, config)

      if (result.success) {
        showNotification('成功', 'Notionに保存しました！')
      } else {
        showNotification('エラー', result.error || '保存に失敗しました')
      }
    } catch (error) {
        console.error('Save error:', error)
        showNotification(
          'エラー',
          error instanceof Error ? error.message : '保存に失敗しました'
        )
      }
    }
  }
)

function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title,
    message,
  })
}

export {}
