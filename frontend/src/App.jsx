import { useState, useEffect } from 'react'

function App() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [response, setResponse] = useState('')
  const [scripts, setScripts] = useState([])
  const [selectedScript, setSelectedScript] = useState(null)
  const [stats, setStats] = useState(null)
  const [characters, setCharacters] = useState(null)
  const [dialogueCount, setDialogueCount] = useState(null)

  useEffect(() => {
    async function loadScripts() {
      const res = await fetch('http://127.0.0.1:8000/scripts')
      setScripts(await res.json())
    }
    loadScripts()
  }, [])

  async function sendToBackend() {
    const res = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    })

    const data = await res.json()
    setResponse(data.message)
    setTitle('')
    setContent('')

    const scriptsRes = await fetch('http://127.0.0.1:8000/scripts')
    setScripts(await scriptsRes.json())
  }

  async function getStats(scriptId) {
    const res = await fetch(`http://127.0.0.1:8000/scripts/${scriptId}/stats`)
    setStats(await res.json())
  }

  async function getCharacters(scriptId) {
    const res = await fetch(
      `http://127.0.0.1:8000/scripts/${scriptId}/characters`,
    )
    setCharacters(await res.json())
  }

  async function getDialogueCount(scriptId) {
    const res = await fetch(
      `http://127.0.0.1:8000/scripts/${scriptId}/dialogue`,
    )
    setDialogueCount(await res.json())
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Script Upload Test</h2>
      <input
        value={title}
        placeholder="Script title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        value={content}
        placeholder="Place script here..."
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <button onClick={sendToBackend}>Send</button>

      <p>Backend response: {response}</p>

      <h3>Scripts</h3>

      <ul>
        {scripts.map((script) => (
          <li key={script.id} onClick={() => setSelectedScript(script)}>
            {script.title}
            <button onClick={() => getStats(script.id)}>View Stats</button>
            <button onClick={() => getCharacters(script.id)}>
              View Characters
            </button>
            <button onClick={() => getDialogueCount(script.id)}>
              View Dialogue Count
            </button>
          </li>
        ))}
      </ul>

      {selectedScript && (
        <div>
          <h3>{selectedScript.title}</h3>
          <pre>{selectedScript.content}</pre>
        </div>
      )}

      {stats && (
        <div>
          <h3>Statistics</h3>
          <p>Words: {stats.word_count}</p>
          <p>Lines: {stats.line_count}</p>
          <p>Unique Words: {stats.unique_words}</p>
        </div>
      )}

      {characters && (
        <div>
          <h3>Characters</h3>
          <ul>
            {Object.entries(characters).map(([name, count]) => (
              <li key={name}>
                {name} {count}
              </li>
            ))}
          </ul>
        </div>
      )}

      {dialogueCount && (
        <div>
          <h3>Dialogue Count</h3>
          <ul>
            {Object.entries(dialogueCount).map(([name, count]) => (
              <li key={name}>
                {name} {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App
