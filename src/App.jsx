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
                    className="cta"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir no Drive"
                  >
                    →
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
            </div>
          );
        })}
      </div>

      <footer>
        <span>SIEG · Institucional</span>
        <span>sieg.com.br</span>
      </footer>
    </div>
  );
}

export default App;
