export const config = { runtime: "edge" };

import { getDriveAccessToken } from "../_lib/driveAuth.js";
import { readCookie, verifySession } from "../_lib/session.js";

export default async function handler(req) {
  const session = await verifySession(readCookie(req.headers.get("cookie"), "session"));
  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }

  const id = new URL(req.url).pathname.split("/").pop();
  if (!id) {
    return new Response("ID ausente", { status: 400 });
  }

  const token = await getDriveAccessToken();
  const range = req.headers.get("range");

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(range ? { Range: range } : {}),
      },
    }
  );

  const headers = new Headers();
  for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = driveRes.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Cache-Control", "private, max-age=300");

  return new Response(driveRes.body, { status: driveRes.status, headers });
}
