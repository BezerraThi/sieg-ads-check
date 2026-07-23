import Papa from "papaparse";
import { readCookie, verifySession } from "./_lib/session.js";
import { getDriveAccessToken } from "./_lib/driveAuth.js";

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1i7R4V3b9E1WNjRTwG1Z8H9VZdsHMXfDf_w9pJS9ueSM";
const SHEET_GID = process.env.GOOGLE_SHEET_GID || "1711128160"; // aba "identificação de anuncios"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

function driveFileId(url) {
  const match = (url || "").match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function withMimeType(row, token) {
  const fileId = driveFileId(row["Link do anúncio"]);
  if (!fileId) return { ...row, fileId: null, mimeType: null };

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const mimeType = res.ok ? (await res.json()).mimeType : null;
    return { ...row, fileId, mimeType };
  } catch {
    return { ...row, fileId, mimeType: null };
  }
}

export default async function handler(req, res) {
  const session = await verifySession(readCookie(req.headers.cookie, "session"));
  if (!session) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      res.status(502).json({ error: "Falha ao buscar a planilha" });
      return;
    }

    const csv = await response.text();
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

    const token = await getDriveAccessToken();
    const enriched = await Promise.all(data.map((row) => withMimeType(row, token)));

    res.setHeader("Cache-Control", "private, s-maxage=300, stale-while-revalidate=60");
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar a planilha" });
  }
}
