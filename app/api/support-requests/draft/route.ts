import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Plain route handler (not a server action) so it can be called from
// navigator.sendBeacon on tab-close/refresh, where a draft support request
// would otherwise be silently abandoned.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const body = await request.text();
  let id: unknown;
  try {
    id = JSON.parse(body).id;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof id !== "string" || !id) {
    return new Response(null, { status: 400 });
  }

  await sql`
    DELETE FROM support_requests
    WHERE id = ${id} AND profile_id = ${session.sub} AND status = 'draft'
  `;

  return new Response(null, { status: 204 });
}
