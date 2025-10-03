import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock storage utilities
vi.mock('../utils/storage', () => ({
  getNotionConfig: vi.fn(() => Promise.resolve(null)),
  saveNotionConfig: vi.fn(() => Promise.resolve()),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render settings form', () => {
    render(<App />)

    expect(screen.getByText('NotionClip 設定')).toBeDefined()
    expect(screen.getByLabelText('Notion Integration Token')).toBeDefined()
    expect(screen.getByLabelText('Database ID')).toBeDefined()
    expect(screen.getByText('保存')).toBeDefined()
  })

  it('should render instructions', () => {
    render(<App />)

    expect(screen.getByText('使い方')).toBeDefined()
  })
})
