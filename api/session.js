import { readCookie, verifySession } from "./_lib/session.js";

export default async function handler(req, res) {
  const token = readCookie(req.headers.cookie, "session");
  const payload = await verifySession(token);
  res.status(200).json({ authenticated: !!payload, email: payload?.email || null });
}
