"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { normalizeLocalPhone } from "@/lib/phone";
import { verifyPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/session";
import { setSessionCookie, clearSessionCookie } from "@/lib/session-cookie";
import { LoginFormSchema, type LoginFormState } from "@/lib/validation/auth";

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone, password } = validatedFields.data;

  // Matched on digits alone so 05…, 5…, 966… and +966… all reach the same
  // account; numbers are stored as 05XXXXXXXX. Two rows stored in formats that
  // normalise alike are ambiguous, and no password should unlock a guess.
  const rows = (await sql`
    SELECT u.id, u.password_hash, p.role
    FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE regexp_replace(p.phone, '[^0-9]', '', 'g') = ${normalizeLocalPhone(phone)}
      AND p.is_active = true
    LIMIT 2
  `) as { id: string; password_hash: string; role: "member" | "admin" }[];

  const user = rows.length === 1 ? rows[0] : undefined;
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !valid) {
    return { error: "رقم الجوال أو كلمة المرور غير صحيحة." };
  }

  const token = await createSessionToken(user.id, user.role);
  await setSessionCookie(token);

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/portal") ? next : "/portal");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
