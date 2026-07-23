import Papa from "papaparse";

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1i7R4V3b9E1WNjRTwG1Z8H9VZdsHMXfDf_w9pJS9ueSM";
const SHEET_GID = process.env.GOOGLE_SHEET_GID || "1711128160"; // aba "identificação de anuncios"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

export default async function handler(req, res) {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      res.status(502).json({ error: "Falha ao buscar a planilha" });
      return;
    }

    const csv = await response.text();
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar a planilha" });
  }
}
