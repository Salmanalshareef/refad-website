import { sql } from "@/lib/db";
import type { FundBankInfo } from "@/types/db";

export async function getBankInfo() {
  const rows = (await sql`SELECT * FROM fund_bank_info LIMIT 1`) as FundBankInfo[];
  return rows[0] ?? null;
}
