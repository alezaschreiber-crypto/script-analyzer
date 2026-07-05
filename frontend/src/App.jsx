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
  const [response, setResponse] = useState('')
  const [scripts, setScripts] = useState([])
  const [selectedScript, setSelectedScript] = useState(null)
  const [stats, setStats] = useState(null)
  const [dialogue, setDialogue] = useState(null)

  async function loadScripts() {
    const res = await fetch(`${API}/scripts`)
    setScripts(await res.json())
  }

  useEffect(() => {
    // Load the script list once on mount; state is set after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadScripts()
  }, [])

  async function sendToBackend() {
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    const data = await res.json()
    setResponse(data.message)
    setTitle('')
    setContent('')
    loadScripts()
  }

  // Selecting a script loads its analytics in one step.
  async function selectScript(script) {
    setSelectedScript(script)
    setStats(null)
    setDialogue(null)
    const [statsRes, dialogueRes] = await Promise.all([
      fetch(`${API}/scripts/${script.id}/stats`),
      fetch(`${API}/scripts/${script.id}/dialogue`),
    ])
    setStats(await statsRes.json())
    setDialogue(await dialogueRes.json())
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
            <button onClick={sendToBackend}>Save script</button>
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
            />
          )}
        </main>
      </div>
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

function Dashboard({ title, stats, dialogue }) {
  const loading = stats === null || dialogue === null

  // { NAME: lines } → sorted [{ name, lines }]
  const speakers =
    dialogue && !dialogue.error
      ? Object.entries(dialogue)
          .map(([name, lines]) => ({ name, lines }))
          .filter((d) => d.lines > 0)
          .sort((a, b) => b.lines - a.lines)
      : []

  const topSpeakers = speakers.slice(0, 10)

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
        </>
      )}
    </>
  )
}

export default App
