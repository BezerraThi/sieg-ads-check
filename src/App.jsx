import { useEffect, useMemo, useState } from "react";
import "./App.css";

function driveFileId(url) {
  const match = (url || "").match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function App() {
  const [creatives, setCreatives] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch("/api/creatives")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar dados");
        return res.json();
      })
      .then((data) => {
        setCreatives(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return creatives.filter((row) =>
      (row["utm_content (anúncio)"] || "").toLowerCase().includes(term)
    );
  }, [creatives, query]);

  return (
    <div className="page">
      <header>
        <img className="selo" src="/sieg-selo.png" alt="" />
        <span className="tag">SIEG · Institucional</span>
        <h1>Ads Check</h1>
        <p>Cole a utm_content do lead pra ver qual anúncio gerou o MQL.</p>
      </header>

      <div className="search-box">
        <img className="search-icon" src="/search-icon.png" alt="" />
        <input
          className="search"
          type="text"
          placeholder="Buscar por utm_content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {status === "loading" && <p className="hint">Carregando planilha...</p>}
      {status === "error" && (
        <p className="hint error">Não consegui carregar os dados da planilha.</p>
      )}

      {status === "ready" && query.trim() && (
        <p className="hint">
          {results.length} resultado{results.length === 1 ? "" : "s"}
        </p>
      )}

      <div className="results">
        {results.map((row, i) => {
          const fileId = driveFileId(row["Link do anúncio"]);
          const link = row["Link do anúncio"];
          return (
            <div className="card" key={i}>
              <div className="card-header">
                <p className="utm">{row["utm_content (anúncio)"]}</p>
                {link && (
                  <a
                    className="drive-btn"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buscar no Drive
                  </a>
                )}
              </div>
              {fileId && (
                <iframe
                  className="preview"
                  src={`https://drive.google.com/file/d/${fileId}/preview`}
                  allow="autoplay"
                  title={row["utm_content (anúncio)"]}
                />
              )}
              {fileId && (
                <a
                  className="download-btn"
                  href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Baixar criativo
                </a>
              )}
            </div>
          );
        })}
      </div>

      <footer>
        <span>SIEG · Institucional</span>
      </footer>
    </div>
  );
}

export default App;
