import { useEffect, useMemo, useState } from "react";
import Login from "./Login.jsx";
import "./App.css";

function App() {
  const [auth, setAuth] = useState("checking"); // checking | out | in
  const [creatives, setCreatives] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => setAuth(data.authenticated ? "in" : "out"))
      .catch(() => setAuth("out"));
  }, []);

  useEffect(() => {
    if (auth !== "in") return;
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
  }, [auth]);

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

      {auth === "out" && <Login onSuccess={() => setAuth("in")} />}

      {auth === "in" && (
        <>
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
              const isVideo = (row.mimeType || "").startsWith("video/");
              const isImage = (row.mimeType || "").startsWith("image/");
              const mediaUrl = row.fileId ? `/api/media/${row.fileId}` : null;

              return (
                <div className="card" key={i}>
                  <div className="card-header">
                    <p className="utm">{row["utm_content (anúncio)"]}</p>
                    {row["Link do anúncio"] && (
                      <a
                        className="cta"
                        href={row["Link do anúncio"]}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir no Drive"
                      >
                        →
                      </a>
                    )}
                  </div>
                  {mediaUrl && isVideo && (
                    <video className="preview" src={mediaUrl} controls />
                  )}
                  {mediaUrl && isImage && (
                    <img className="preview" src={mediaUrl} alt="" />
                  )}
                  {mediaUrl && !isVideo && !isImage && (
                    <p className="hint">Prévia indisponível para esse arquivo.</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <footer>
        <span>SIEG · Institucional</span>
      </footer>
    </div>
  );
}

export default App;
