import React, { useState, useEffect } from 'react'

interface GraphRecord {
  id: string
  title: string
  description: string | null
  prerequisites: string[]
}

export default function Neo4jTest() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prerequisiteTitle, setPrerequisiteTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [records, setRecords] = useState<GraphRecord[]>([])
  const [isInserting, setIsInserting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 初期ロード時に全件取得
  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async (query = '') => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/test/neo4j?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      const data = await response.json()
      setRecords(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setMessage({ type: 'error', text: '講義名を入力してください。' })
      return
    }

    setIsInserting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/test/neo4j', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          prerequisite_title: prerequisiteTitle.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to insert record')
      }

      setMessage({ type: 'success', text: 'Neo4j にノードおよびリレーションを正常に保存しました！' })
      setTitle('')
      setDescription('')
      setPrerequisiteTitle('')
      fetchRecords(searchQuery) // リストを更新
    } catch (err: any) {
      setMessage({ type: 'error', text: 'データの保存に失敗しました。' })
    } finally {
      setIsInserting(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRecords(searchQuery)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Neo4j Communication Test</h1>
      <p style={styles.subtitle}>
        Frontend (React) ⇔ Backend (FastAPI) ⇔ Neo4j (GraphDB) の疎通テスト用ページです。
      </p>

      {message && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'success' ? 'var(--accent-bg)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: message.type === 'success' ? 'var(--accent-border)' : 'rgba(239, 68, 68, 0.4)',
          color: message.type === 'success' ? 'var(--accent)' : '#ef4444',
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* データ入力フォーム */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>グラフデータ登録</h2>
          <form onSubmit={handleInsert} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>講義名 (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: データ構造とアルゴリズム"
                style={styles.input}
                disabled={isInserting}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>概要 (Description)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="講義の内容や詳細を入力してください"
                style={styles.textarea}
                disabled={isInserting}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>前提講義名 (Prerequisite Course Title) - 任意</label>
              <input
                type="text"
                value={prerequisiteTitle}
                onChange={(e) => setPrerequisiteTitle(e.target.value)}
                placeholder="例: プログラミング基礎 (関係性を接続)"
                style={styles.input}
                disabled={isInserting}
              />
              <span style={styles.inputHint}>指定された場合、自動的に :REQUIRES_PREREQUISITE 関係が作成されます。</span>
            </div>
            <button type="submit" style={styles.button} disabled={isInserting}>
              {isInserting ? '保存中...' : 'Neo4j に保存'}
            </button>
          </form>
        </div>

        {/* 検索・結果表示エリア */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>グラフ探索・一覧</h2>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索する講義名やキーワード..."
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              検索
            </button>
          </form>

          {isSearching ? (
            <div style={styles.loading}>探索中...</div>
          ) : records.length === 0 ? (
            <div style={styles.noData}>ノードが見つかりません。</div>
          ) : (
            <div style={styles.list}>
              {records.map((record) => (
                <div key={record.id} style={styles.listItem}>
                  <div style={styles.itemHeader}>
                    <span style={styles.itemTitle}>{record.title}</span>
                    <span style={styles.itemId}>{record.id.substring(0, 8)}...</span>
                  </div>
                  {record.description && (
                    <p style={styles.itemDescription}>{record.description}</p>
                  )}
                  {record.prerequisites.length > 0 && (
                    <div style={styles.relations}>
                      <span style={styles.relationLabel}>前提条件:</span>
                      <div style={styles.tagsContainer}>
                        {record.prerequisites.filter(Boolean).map((pTitle, idx) => (
                          <span key={idx} style={styles.tag}>
                            {pTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: 'var(--text-h)',
    fontWeight: 500,
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text)',
    marginBottom: '2rem',
  },
  alert: {
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    alignItems: 'start',
  },
  card: {
    background: 'var(--social-bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--shadow)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: 'var(--text-h)',
    borderBottom: '2px solid var(--border)',
    paddingBottom: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: 'var(--text-h)',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    fontSize: '1rem',
    outline: 'none',
  },
  inputHint: {
    fontSize: '0.75rem',
    color: 'var(--text)',
  },
  textarea: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    fontSize: '1rem',
    minHeight: '100px',
    outline: 'none',
    resize: 'vertical',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    fontSize: '1rem',
    outline: 'none',
  },
  searchButton: {
    padding: '0.75rem 1.2rem',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--code-bg)',
    color: 'var(--text-h)',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem 0',
    color: 'var(--text)',
  },
  noData: {
    textAlign: 'center',
    padding: '2rem 0',
    color: 'var(--text)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  listItem: {
    padding: '1rem',
    borderRadius: '8px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  itemTitle: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: 'var(--text-h)',
  },
  itemId: {
    fontSize: '0.8rem',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
  },
  itemDescription: {
    fontSize: '0.9rem',
    color: 'var(--text)',
    margin: 0,
  },
  relations: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  relationLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'var(--text-h)',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  tag: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    background: 'var(--accent-bg)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
}
