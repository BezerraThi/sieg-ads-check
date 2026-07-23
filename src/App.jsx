import { useEffect, useMemo, useState } from "react";
import "./App.css";

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
        <h1>Ads Check</h1>
        <p>Cole a utm_content do lead pra ver qual anúncio gerou o MQL.</p>
      </header>

      <input
        className="search"
        type="text"
        placeholder="Buscar por utm_content..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

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
        {results.map((row, i) => (
          <div className="card" key={i}>
            <p className="utm">{row["utm_content (anúncio)"]}</p>
            {row["Link do anúncio"] && (
              <a href={row["Link do anúncio"]} target="_blank" rel="noreferrer">
                Ver criativo →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
