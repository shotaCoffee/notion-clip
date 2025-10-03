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
      // Show "saving..." notification
      const savingNotificationId = await showNotification(
        '保存中...',
        '記事を抽出してNotionに保存しています'
      )

      // Set badge to show processing
      chrome.action.setBadgeText({ text: '...' })
      chrome.action.setBadgeBackgroundColor({ color: '#0078D4' })

      try {
        // Send message to content script to extract content
        const message: ExtractContentMessage = { action: 'extractContent' }
        const response = (await chrome.tabs.sendMessage(
          tab.id,
          message
        )) as ExtractContentResponse

        if (!response.success) {
          // Clear saving notification
          chrome.notifications.clear(savingNotificationId)
          chrome.action.setBadgeText({ text: '✗' })
          chrome.action.setBadgeBackgroundColor({ color: '#D13438' })

          showNotification(
            'エラー',
            response.error || '本文の抽出に失敗しました'
          )

          // Clear badge after 3 seconds
          setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
          return
        }

        const extracted: ExtractedContent = response.data!

        // Get Notion configuration
        const config = await getNotionConfig()
        if (!config) {
          chrome.notifications.clear(savingNotificationId)
          chrome.action.setBadgeText({ text: '✗' })
          chrome.action.setBadgeBackgroundColor({ color: '#D13438' })

          showNotification('エラー', 'Notion設定が必要です。拡張機能アイコンをクリックして設定してください。')

          setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
          return
        }

        // Save to Notion
        const result = await saveToNotion(extracted, config)

        // Clear saving notification
        chrome.notifications.clear(savingNotificationId)

        if (result.success) {
          chrome.action.setBadgeText({ text: '✓' })
          chrome.action.setBadgeBackgroundColor({ color: '#107C10' })

          showNotification(
            '✅ 保存完了',
            `「${extracted.title}」をNotionに保存しました！`
          )

          // Clear badge after 3 seconds
          setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
        } else {
          chrome.action.setBadgeText({ text: '✗' })
          chrome.action.setBadgeBackgroundColor({ color: '#D13438' })

          showNotification('❌ エラー', result.error || '保存に失敗しました')

          setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
        }
      } catch (error) {
        console.error('Save error:', error)
        chrome.notifications.clear(savingNotificationId)
        chrome.action.setBadgeText({ text: '✗' })
        chrome.action.setBadgeBackgroundColor({ color: '#D13438' })

        showNotification(
          '❌ エラー',
          error instanceof Error ? error.message : '保存に失敗しました'
        )

        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000)
      }
    }
  }
)

function showNotification(title: string, message: string): Promise<string> {
  return chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
    title,
    message,
    priority: 2,
  })
}

export {}
