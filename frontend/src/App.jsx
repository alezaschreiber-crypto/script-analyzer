import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts'

const API = 'http://127.0.0.1:8000'

// Categorical slots from the dataviz reference palette (swap in dark mode via CSS).
const SERIES = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
]

function App() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadWarning, setUploadWarning] = useState('')
  const [pendingUpload, setPendingUpload] = useState(null)
  const [response, setResponse] = useState('')
  const [scripts, setScripts] = useState([])
  const [selectedScript, setSelectedScript] = useState(null)
  const [stats, setStats] = useState(null)
  const [dialogue, setDialogue] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  async function loadScripts() {
    const res = await fetch(`${API}/scripts`)
    setScripts(await res.json())
  }

  useEffect(() => {
    // Load the script list once on mount; state is set after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadScripts()
  }, [])

  async function saveScript(payload) {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setResponse(data.message)
    setUploadWarning(data.warning || '')
    setTitle('')
    setContent('')
    setFileName('')
    loadScripts()
  }

  async function sendToBackend() {
    if (!title.trim() || !content.trim()) {
      setUploadError('Add a title and script content before saving.')
      return
    }

    setUploadError('')
    setUploadWarning('')
    const payload = { title: title.trim(), content }
    const validationRes = await fetch(`${API}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const validation = await validationRes.json()
    if (validation.format_check?.warning) {
      setPendingUpload(payload)
      return
    }
    await saveScript(payload)
  }

  async function deleteScript(script) {
    if (!window.confirm(`Delete “${script.title}”?`)) return
    await fetch(`${API}/scripts/${script.id}`, { method: 'DELETE' })
    if (selectedScript?.id === script.id) {
      setSelectedScript(null)
      setStats(null)
      setDialogue(null)
      setAnalytics(null)
    }
    loadScripts()
  }

  function discardPendingUpload() {
    setPendingUpload(null)
    setTitle('')
    setContent('')
    setFileName('')
    setUploadWarning('')
    setUploadError('')
    setResponse('')
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setUploadError('Please choose a plain-text .txt file.')
      event.target.value = ''
      return
    }

    try {
      const text = await file.text()
      if (!text.trim()) {
        setUploadError('That file is empty.')
        return
      }
      setContent(text)
      setFileName(file.name)
      setUploadError('')
      if (!title.trim()) {
        setTitle(file.name.replace(/\.txt$/i, ''))
      }
    } catch {
      setUploadError('The file could not be read.')
    }
  }

  // Selecting a script loads its analytics in one step.
  async function selectScript(script) {
    setSelectedScript(script)
    setStats(null)
    setDialogue(null)
    setAnalytics(null)
    const [statsRes, dialogueRes, analyticsRes] = await Promise.all([
      fetch(`${API}/scripts/${script.id}/stats`),
      fetch(`${API}/scripts/${script.id}/dialogue`),
      fetch(`${API}/scripts/${script.id}/analytics`),
    ])
    setStats(await statsRes.json())
    setDialogue(await dialogueRes.json())
    setAnalytics(await analyticsRes.json())
  }

  return (
    <div>
      <header className="app-header">
        <h1>ScriptScope</h1>
        <p>Theatre script analytics — upload a play and explore who speaks.</p>
      </header>

      <div className="layout">
        <aside>
          <section className="card upload">
            <h2>Upload a script</h2>
            <input
              value={title}
              placeholder="Script title"
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              value={content}
              placeholder="Paste script text here…"
              onChange={(e) => setContent(e.target.value)}
            />
            <label className="file-picker">
              <span>Or choose a .txt file</span>
              <input type="file" accept=".txt,text/plain" onChange={handleFileChange} />
            </label>
            {fileName && <p className="hint">Loaded: {fileName}</p>}
            <button onClick={sendToBackend}>Save script</button>
            {uploadError && <p className="error">{uploadError}</p>}
            {uploadWarning && <p className="warning">{uploadWarning}</p>}
            {response && <p className="hint">{response}</p>}
          </section>

          <section className="card">
            <h2>Scripts</h2>
            {scripts.length === 0 ? (
              <p className="hint">No scripts yet.</p>
            ) : (
              <ul className="script-list">
                {scripts.map((script) => (
                  <li
                    key={script.id}
                    className={
                      selectedScript?.id === script.id ? 'active' : undefined
                    }
                    onClick={() => selectScript(script)}
                  >
                    {script.title}
                    <button
                      className="delete-script"
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteScript(script)
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <main>
          {!selectedScript ? (
            <div className="card empty">
              Select a script to see its analytics.
            </div>
          ) : (
            <Dashboard
              title={selectedScript.title}
              stats={stats}
              dialogue={dialogue}
              analytics={analytics}
            />
          )}
        </main>
      </div>
      {pendingUpload && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-warning-title">
            <h2 id="upload-warning-title">Format warning</h2>
            <p>
              This file may not be a Project Gutenberg-formatted play. Analytics may be incomplete.
            </p>
            <p>Upload anyway?</p>
            <div className="modal-actions">
              <button onClick={discardPendingUpload} className="secondary-button">No</button>
              <button
                onClick={async () => {
                  const payload = pendingUpload
                  setPendingUpload(null)
                  await saveScript(payload)
                }}
              >
                Yes, upload anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const numberFmt = new Intl.NumberFormat('en-US')

function StatTiles({ stats }) {
  const tiles = [
    { label: 'Words', value: stats.word_count },
    { label: 'Lines', value: stats.line_count },
    { label: 'Unique words', value: stats.unique_words },
  ]
  return (
    <div className="tiles">
      {tiles.map((t) => (
        <div className="tile" key={t.label}>
          <div className="value">{numberFmt.format(t.value ?? 0)}</div>
          <div className="label">{t.label}</div>
        </div>
      ))}
    </div>
  )
}

function tooltipStyle() {
  return {
    background: 'var(--surface-1)',
    border: '1px solid var(--viz-border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  }
}

function TopSpeakers({ data }) {
  // Single measure (spoken lines) ranked → one series color.
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 44, bottom: 4, left: 8 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--gridline)" />
        <XAxis
          type="number"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          stroke="var(--baseline)"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          cursor={{ fill: 'var(--gridline)', opacity: 0.4 }}
          formatter={(v) => [`${numberFmt.format(v)} lines`, 'Dialogue']}
        />
        <Bar dataKey="lines" fill="var(--series-1)" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="lines"
            position="right"
            fill="var(--text-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function Distribution({ data }) {
  // Composition: each character's share of total dialogue, one 100% stacked bar.
  const total = data.reduce((sum, d) => sum + d.lines, 0)
  const row = { name: 'Dialogue' }
  data.forEach((d) => {
    row[d.name] = d.lines
  })

  return (
    <>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart
          layout="vertical"
          data={[row]}
          stackOffset="expand"
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <XAxis type="number" hide domain={[0, 1]} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            contentStyle={tooltipStyle()}
            formatter={(v, name) => [
              `${numberFmt.format(v)} lines (${((v / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          {data.map((d, i) => (
            <Bar
              key={d.name}
              dataKey={d.name}
              stackId="share"
              fill={SERIES[i % SERIES.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="legend">
        {data.map((d, i) => (
          <span className="item" key={d.name}>
            <span
              className="swatch"
              style={{ background: SERIES[i % SERIES.length] }}
            />
            {d.name} · {((d.lines / total) * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </>
  )
}

function Dashboard({ title, stats, dialogue, analytics }) {
  const loading = stats === null || dialogue === null || analytics === null

  // { NAME: lines } → sorted [{ name, lines }]
  const speakers =
    dialogue && !dialogue.error
      ? Object.entries(dialogue)
          .map(([name, lines]) => ({ name, lines }))
          .filter((d) => d.lines > 0)
          .sort((a, b) => b.lines - a.lines)
      : []

  const topSpeakers = speakers.slice(0, 10)
  const characterMetrics = analytics?.characters ?? []
  const scenes = analytics?.scenes ?? []

  // Distribution: top 7 named + everyone else folded into "Other".
  const TOP = 7
  const distribution = speakers.slice(0, TOP)
  const restLines = speakers.slice(TOP).reduce((sum, d) => sum + d.lines, 0)
  if (restLines > 0) distribution.push({ name: 'Other', lines: restLines })

  return (
    <>
      <h2 style={{ marginBottom: '1rem' }}>{title}</h2>

      {loading ? (
        <div className="card empty">Loading analytics…</div>
      ) : (
        <>
          {stats && !stats.error && <StatTiles stats={stats} />}

          {characterMetrics.length > 0 && (
            <section className="card">
              <h2>Character metrics</h2>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Character</th><th>Words</th><th>Share</th><th>Scenes</th></tr></thead>
                  <tbody>
                    {characterMetrics.map((character) => (
                      <tr key={character.name}>
                        <td>{character.name}</td>
                        <td>{numberFmt.format(character.words)}</td>
                        <td>{character.dialogue_percentage}%</td>
                        <td>{character.scene_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="card">
            <h2>Top speaking characters</h2>
            {topSpeakers.length > 0 ? (
              <div className="chart-wrap">
                <TopSpeakers data={topSpeakers} />
              </div>
            ) : (
              <p className="hint">No dialogue detected in this script.</p>
            )}
          </section>

          {distribution.length > 1 && (
            <section className="card">
              <h2>Dialogue distribution</h2>
              <Distribution data={distribution} />
            </section>
          )}

          {scenes.length > 0 && (
            <section className="card">
              <h2>Scene participation</h2>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Scene</th><th>Words</th><th>Characters</th></tr></thead>
                  <tbody>
                    {scenes.map((scene) => (
                      <tr key={scene.name}>
                        <td>{scene.name}</td>
                        <td>{numberFmt.format(scene.words)}</td>
                        <td>{scene.characters.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}

export default App
