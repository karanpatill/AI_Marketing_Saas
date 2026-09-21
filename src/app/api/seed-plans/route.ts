import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";
import { requireCronSecret } from "@/backend/middlewares/auth";
import { BaseError } from "@/backend/utils/errors";

// One-off operational endpoint. Protected by CRON_SECRET so it cannot be used
// to rewrite pricing plans from the public internet.
export async function GET(req: Request) {
  try {
    requireCronSecret(req);
  } catch (error: any) {
    const status = error instanceof BaseError ? error.statusCode : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }

  const supabase = createAdminClient();
  const plans = [
    { id: 'free', name: 'Starter', type: 'free', price_monthly: 0, token_allowance: 10, features: { description: '10 tokens total' } },
    { id: 'pro', name: 'Pro', type: 'pro', price_monthly: 2900, token_allowance: 100, features: { description: '100 tokens per month' } },
    { id: 'automate_brand', name: 'Automate', type: 'automate_brand', price_monthly: 9900, token_allowance: 500, features: { description: '500 tokens & Autopilot' } }
  ];

  const errors = [];
  for (const p of plans) {
    const { error } = await supabase.from('plans').upsert(p);
    if (error) errors.push(error);
  }

  const { data } = await supabase.from('plans').select('*');
  return NextResponse.json({ success: true, errors, data });
}
