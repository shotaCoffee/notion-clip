import { useState, useEffect } from 'react'
import type { NotionConfig } from '../types'
import { getNotionConfig, saveNotionConfig } from '../utils/storage'

function App() {
  const [config, setConfig] = useState<NotionConfig | null>(null)
  const [tokenInput, setTokenInput] = useState('')
  const [databaseIdInput, setDatabaseIdInput] = useState('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Load saved configuration
    getNotionConfig().then(savedConfig => {
      if (savedConfig) {
        setConfig(savedConfig)
        setTokenInput(savedConfig.token)
        setDatabaseIdInput(savedConfig.databaseId)
      }
    })
  }, [])

  const handleSave = async () => {
    if (!tokenInput.trim() || !databaseIdInput.trim()) {
      setMessage('❌ すべての項目を入力してください')
      return
    }

    const newConfig: NotionConfig = {
      token: tokenInput.trim(),
      databaseId: databaseIdInput.trim(),
    }

    await saveNotionConfig(newConfig)
    setConfig(newConfig)
    setMessage('✅ 設定を保存しました')

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  return (
    <div className="container">
      <header>
        <h1>NotionClip 設定</h1>
        <p className="subtitle">記事をNotionに保存</p>
      </header>

      <div className="settings">
        <div className="form-group">
          <label htmlFor="token">Notion Integration Token</label>
          <input
            id="token"
            type="password"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="secret_..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="database">Database ID</label>
          <input
            id="database"
            type="text"
            value={databaseIdInput}
            onChange={e => setDatabaseIdInput(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <button onClick={handleSave} className="save-button">
          保存
        </button>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>
        )}
      </div>

      <div className="instructions">
        <h3>使い方</h3>
        <ol>
          <li>
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
            >
              Notion Integration
            </a>
            を作成してTokenを取得
          </li>
          <li>Notionでデータベースを作成</li>
          <li>データベースにIntegrationを接続</li>
          <li>上記フォームにTokenとDatabase IDを入力</li>
          <li>記事ページで右クリック→「Notionに保存」</li>
        </ol>
      </div>

      {config && (
        <div className="status">
          <span className="status-indicator">●</span> 設定済み
        </div>
      )}
    </div>
  )
}

export default App
