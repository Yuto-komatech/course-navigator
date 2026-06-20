import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import PostgresTest from './components/PostgresTest'
import Neo4jTest from './components/Neo4jTest'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
        {/* ナビゲーションバー */}
        <nav style={styles.navBar}>
          <div style={styles.navLogo}>
            <span style={styles.navLogoText}>Course Navigator</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/test1" style={styles.navLink}>Postgres Test (test1)</Link>
            <Link to="/test2" style={styles.navLink}>Neo4j Test (test2)</Link>
            <Link to="/test3" style={styles.navLink}>Integrated Test (test3)</Link>
          </div>
        </nav>

        {/* ルーティング定義 */}
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/test1" element={<PostgresTest />} />
          <Route path="/test2" element={<Neo4jTest />} />
          <Route
            path="/test3"
            element={
              <div style={{ padding: '3rem', textAlign: 'left' }}>
                <h1 style={{ color: 'var(--text-h)' }}>Integrated DB Test (Future)</h1>
                <p style={{ color: 'var(--text)' }}>
                  PostgreSQL ＋ Neo4j の一貫性・連携疎通確認テスト画面（準備中）
                </p>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function WelcomeScreen() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Hello Course Navi with AntigravitySDK! </h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noreferrer">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--social-bg)',
    backdropFilter: 'blur(8px)',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
  },
  navLogoText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'var(--text-h)',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    color: 'var(--text)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
}

export default App
