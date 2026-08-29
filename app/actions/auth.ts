"use server";

import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken } from "@/lib/session";
import { setSessionCookie, clearSessionCookie } from "@/lib/session-cookie";
import {
  ForgotPasswordFormSchema,
  LoginFormSchema,
  type ForgotPasswordFormState,
  type LoginFormState,
} from "@/lib/validation/auth";

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

  const rows = (await sql`
    SELECT u.id, u.password_hash, p.role
    FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE p.phone = ${phone}
  `) as { id: string; password_hash: string; role: "member" | "admin" }[];

  const user = rows[0];
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

export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const validatedFields = ForgotPasswordFormSchema.safeParse({
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  // No SMS service is wired up yet, so this is a placeholder that always
  // reports success (and avoids leaking which phone numbers have accounts).
  return { success: true };
}
