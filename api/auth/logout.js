import { CLEAR_SESSION_COOKIE } from "../_lib/session.js";

export default async function handler(req, res) {
  res.setHeader("Set-Cookie", CLEAR_SESSION_COOKIE);
  res.status(200).json({ ok: true });
}
