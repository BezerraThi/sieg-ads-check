import { jwtVerify, createRemoteJWKSet } from "jose";
import { createSession, sessionCookieHeader } from "../_lib/session.js";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const ALLOWED_DOMAIN = process.env.ALLOWED_GOOGLE_DOMAIN || "sieg.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { credential } = req.body || {};
  if (!credential) {
    res.status(400).json({ error: "Credential ausente" });
    return;
  }

  try {
    const { payload } = await jwtVerify(credential, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const email = payload.email;
    const domain = typeof email === "string" ? email.split("@")[1] : null;

    if (!payload.email_verified || domain !== ALLOWED_DOMAIN) {
      res.status(403).json({ error: `Apenas contas @${ALLOWED_DOMAIN}` });
      return;
    }

    const token = await createSession(email);
    res.setHeader("Set-Cookie", sessionCookieHeader(token));
    res.status(200).json({ email });
  } catch {
    res.status(401).json({ error: "Falha na autenticação" });
  }
}
