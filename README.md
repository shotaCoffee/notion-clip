# NotionClip

Web記事をワンクリックでNotionに保存できるChrome拡張機能です。記事の本文を自動抽出し、Markdown形式でNotionデータベースに保存します。

## 機能

- 🚀 **ワンクリック保存**: 右クリックメニューから記事を保存
- 📝 **自動抽出**: [Readability](https://github.com/mozilla/readability)を使用して記事本文を自動抽出
- ✍️ **Markdown変換**: HTMLをMarkdownに変換してNotionに保存
- 📊 **メタデータ保存**: タイトル、URL、著者、保存日時などを自動記録

## インストール方法

### 1. 拡張機能のインストール

1. [Releases](https://github.com/yourusername/notion-clip/releases)から最新版をダウンロード
2. ZIPファイルを展開
3. Chromeで `chrome://extensions/` を開く
4. 右上の「デベロッパーモード」をONにする
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. 展開したフォルダ内の `dist` フォルダを選択

### 2. Notion側のセットアップ

#### Integration作成

1. https://www.notion.so/my-integrations にアクセス
2. 「+ New integration」をクリック
3. 以下を入力：
    - **Name**: `NotionClip` (任意の名前)
    - **Associated workspace**: 使用するワークスペースを選択
4. 「Submit」をクリック
5. 表示される **Integration Token** (`secret_...`で始まる文字列) をコピーして保存

#### データベース作成

1. Notionで新しいページを作成
2. `/database` と入力して **Table - Inline** を選択
3. データベース名を「📰 Saved Articles」などに変更
4. 以下のプロパティを設定：

| プロパティ名         | タイプ   | 必須 | 説明      |
|----------------|-------|----|---------|
| **Name**       | Title | ✅  | 記事のタイトル |
| **URL**        | URL   | ✅  | 記事のURL  |
| **Saved Date** | Date  | ✅  | 保存日時    |
| **Author**     | Text  | -  | 著者名     |
| **Site Name**  | Text  | -  | サイト名    |

**プロパティの追加方法**:

- テーブルの右端の「+」をクリック
- プロパティ名を入力してタイプを選択

#### Integrationをデータベースに接続

1. データベースページの右上「...」メニューをクリック
2. 「Connect to」→ 作成した Integration名（例: `NotionClip`）を選択

#### Database ID取得

データベースのURLから32文字のIDをコピー：

```
https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                    ↑この32文字がDatabase ID
```

### 3. 拡張機能の設定

1. Chromeツールバーの **NotionClipアイコン** をクリック
2. ポップアップが開いたら「**Settings**」ボタンをクリック
3. 以下を入力：
    - **Notion Integration Token**: 先ほど取得した `secret_...` のトークン
    - **Database ID**: データベースURLから取得した32文字のID
4. 「**Save**」をクリック

## 使い方

1. 保存したい記事（ブログ、ニュースサイトなど）を開く
2. ページ上で **右クリック**
3. メニューから「**Notionに保存**」を選択
4. 通知が表示され、Notionデータベースに記事が保存されます

## 対応サイト

- ニュースサイト
- ブログ記事
- 技術記事
- Mediumなどのプラットフォーム

**注意**: 一部のサイトでは記事の抽出がうまくいかない場合があります。その場合は通知でエラーが表示されます。

## トラブルシューティング

### 「Receiving end does not exist」エラー

拡張機能を更新/インストールした後は、**既存のタブでは動作しません**。新しいタブを開いてお試しください。

### 「Notion設定が必要です」エラー

拡張機能アイコンをクリックして、Integration TokenとDatabase IDが正しく設定されているか確認してください。

### 記事が保存されない

1. Notionデータベースに Integration が接続されているか確認
2. データベースに必須プロパティ（Name, URL, Saved Date）があるか確認
3. Integration Token が有効か確認

## プライバシー

- すべてのデータはあなたのNotionアカウントにのみ保存されます
- 開発者がデータを収集・保存することはありません
- 記事の抽出はローカル（ブラウザ内）で行われます

## ライセンス

MIT License

---

**開発**: shotaCoffee
**問題報告**: [GitHub Issues](https://github.com/yourusername/notion-clip/issues)
