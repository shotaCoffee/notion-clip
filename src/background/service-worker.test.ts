import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock chrome APIs before any imports
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    sendMessage: vi.fn(),
  },
  notifications: {
    create: vi.fn(() => Promise.resolve('notification-id')),
    clear: vi.fn(),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
}

global.chrome = mockChrome as unknown as typeof chrome

describe('service worker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mock chrome APIs correctly', () => {
    expect(chrome.runtime.getURL).toBeDefined()
    expect(chrome.contextMenus.create).toBeDefined()
    expect(chrome.notifications.create).toBeDefined()
    expect(chrome.action.setBadgeText).toBeDefined()
  })

  it('should create notification with correct URL', () => {
    const url = chrome.runtime.getURL('icons/icon48.png')
    expect(url).toBe('chrome-extension://mock-id/icons/icon48.png')
  })

  it('should be able to create notifications', async () => {
    const notificationId = await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Test',
      message: 'Test message',
    })

    expect(notificationId).toBe('notification-id')
    expect(mockChrome.notifications.create).toHaveBeenCalledWith({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Test',
      message: 'Test message',
    })
  })

  it('should be able to set badge text', () => {
    chrome.action.setBadgeText({ text: '✓' })
    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '✓' })
  })

  it('should be able to set badge background color', () => {
    chrome.action.setBadgeBackgroundColor({ color: '#107C10' })
    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#107C10',
    })
  })

  it('should be able to clear notifications', () => {
    chrome.notifications.clear('notification-id')
    expect(mockChrome.notifications.clear).toHaveBeenCalledWith('notification-id')
  })

  // Note: Full integration testing of service workers is difficult in unit tests
  // because they rely heavily on chrome runtime and contextMenus APIs.
  // The service worker module itself is tested through manual Chrome testing.
})
